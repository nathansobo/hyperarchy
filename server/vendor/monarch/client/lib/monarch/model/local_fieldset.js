(function(Monarch) {

Monarch.constructor("Monarch.Model.LocalFieldset", Monarch.Model.Fieldset, {
  initialize: function(record, remote) {
    this.record = record;
    this.remote = remote;
    remote.local = this;
    this.initializeFields();
    this.connectLocalAndRemoteFields();
  },

  valid: function() {
    return _.all(this.fieldsByColumnName, function(field) {
      return field.valid();
    });
  },

  allValidationErrors: function() {
    var allValidationErrors = [];
    _.each(this.fieldsByColumnName, function(field) {
      allValidationErrors = allValidationErrors.concat(field.validationErrors);
    });
    return allValidationErrors;
  },

  dirtyWireRepresentation: function() {
    return this.wireRepresentation(true)
  },

  wireRepresentation: function(onlyDirty) {
    var wireRepresentation = {};
    _.each(this.fieldsByColumnName, function(field, columnName) {
      if (!onlyDirty || field.dirty()) wireRepresentation[_.underscore(columnName)] = field.valueWireRepresentation();
    });
    return wireRepresentation;
  },

  clearValidationErrors: function() {
    _.each(this.fieldsByColumnName, function(field) {
      field.clearValidationErrors();
    });
  },

  assignValidationErrors: function(errorsByFieldName) {
    _.each(this.fieldsByColumnName, function(field, name) {
      if (errorsByFieldName[name]) {
        field.assignValidationErrors(errorsByFieldName[name]);
      } else {
        field.clearValidationErrors();
      }

    }, this);
  },

  dirty: function() {
    return _.any(this.fieldsByColumnName, function(field) {
      return field.dirty();
    });
  },

  fieldMarkedDirty: function() {
    if (!this.Dirty) {
      this.Dirty = true;
      this.record.madeDirty();
    }
  },

  fieldMarkedClean: function() {
    if (!this.dirty()) {
      this.Dirty = false;
      this.record.madeClean();
    }
  },

  beginBatchUpdate: function() {
    this.batchInProgress = true;
    this.batchedUpdates = {};
  },

  finishBatchUpdate: function() {
    this.batchInProgress = false;
    var changeset = this.batchedUpdates;
    this.batchedUpdates = null;

    if (this.updateEventsEnabled && !_.isEmpty(changeset)) {
      if (this.record.onLocalUpdateNode) this.record.onLocalUpdateNode.publish(changeset);
      if (this.record.afterLocalUpdate) this.record.afterLocalUpdate(changeset);
      this.record.table.tupleUpdatedLocally(this.record, changeset);
    }
  },

  fieldUpdated: function(field, newValue, oldValue) {
    var batchWasInProgress = this.batchInProgress;
    if (!batchWasInProgress) this.beginBatchUpdate();

    var changeData = {};
    changeData[field.column.name] = {
      column: field.column,
      oldValue: oldValue,
      newValue: newValue
    };

    _.extend(this.batchedUpdates, changeData);

    if (!batchWasInProgress) this.finishBatchUpdate();
  },

  // private

  connectLocalAndRemoteFields: function() {
    _.each(this.fieldsByColumnName, function(localField, columnName) {
      var remoteField = this.remote.field(columnName);
      localField.remoteField(remoteField);
      remoteField.localField(localField);
    }, this);
  },

  createNewField: function(column) {
    return new Monarch.Model.LocalField(this, column);
  }
});

})(Monarch);
