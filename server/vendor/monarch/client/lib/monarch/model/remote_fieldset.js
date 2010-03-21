(function(Monarch) {

_.constructor("Monarch.Model.RemoteFieldset", Monarch.Model.Fieldset, {
  initialize: function(record) {
    this.record = record;
    this.local = null;
    this.initializeFields();
    this.batchUpdateInProgress = false;
  },

  update: function(fieldValues) {
    this.batchedUpdates = {};

    _.each(fieldValues, function(fieldValue, columnName) {
      var field = this.field(columnName);
      if (field) field.value(fieldValue);
    }, this);

    var changeset = this.batchedUpdates;
    this.batchedUpdates = null;
    if (this.updateEventsEnabled && !_.isEmpty(changeset)) {
      if (this.record.onRemoteUpdateNode) this.record.onRemoteUpdateNode.publish(changeset);
      this.record.table.tupleUpdatedRemotely(this.record, changeset);
    }
  },

  fieldUpdated: function(field, newValue, oldValue) {
    var changeData = {};
    changeData[field.column.name] = {
      column: field.column,
      oldValue: oldValue,
      newValue: newValue
    };

    if (this.batchedUpdates) _.extend(this.batchedUpdates, changeData);
  },

  // private

  createNewField: function(column) {
    return new Monarch.Model.RemoteField(this, column);
  }
});

})(Monarch);
