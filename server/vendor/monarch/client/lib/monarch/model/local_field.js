(function(Monarch) {

Monarch.constructor("Monarch.Model.LocalField", Monarch.Model.ConcreteField, {
  initialize: function(fieldset, column) {
    this.fieldset = fieldset;
    this.column = column;
    this.validationErrors = [];
    this.updateEventsEnabled = true;
  },

  remoteField: function(remoteField) {
    if (arguments.length == 0) {
      return this.RemoteField
    } else {
      return this.RemoteField = remoteField;
    }
  },

  onRemoteUpdate: function(callback) {
    return this.RemoteField.onUpdate(callback);
  },

  dirty: function() {
    return this.Dirty;
  },

  markDirty: function() {
    if (!this.Dirty) {
      this.Dirty = true;
      this.fieldset.fieldMarkedDirty();
    }
  },

  markClean: function() {
    this.clearValidationErrors();
    if (this.Dirty) {
      this.Dirty = false;
      this.fieldset.fieldMarkedClean();
    }
  },

  assignValidationErrors: function(errors) {
    this.validationErrors = errors;
  },

  clearValidationErrors: function() {
    var wasInvalid = !this.fieldset.valid();
    this.validationErrors = [];
    if (this.fieldset.record.onValidNode && wasInvalid && this.fieldset.valid()) this.fieldset.record.onValidNode.publish();
  },

  notModifiedAfter: function(date) {
    return !this.lastModifiedAt || this.lastModifiedAt.getTime() <= date.getTime();
  },

  signal: function(optionalTransformer) {
    return new Monarch.Model.Signal(this, this.remoteField(), optionalTransformer);
  },

  valueWireRepresentation: function() {
    return this.column.convertValueForWire(this.value());
  },

  valid: function() {
    return this.validationErrors.length == 0;
  },

  // private
  
  valueAssigned: function(newValue, oldValue) {
    if (this.valueEquals(this.RemoteField.value())) {
      this.markClean();
    } else {
      this.markDirty();
    }

    if (this.updateEventsEnabled) {
      var batchAlreadyInProgress = this.fieldset.batchInProgress;
      if (!batchAlreadyInProgress) this.fieldset.beginBatchUpdate();
      this.fieldset.fieldUpdated(this, newValue, oldValue);
      if (this.onUpdateNode) this.onUpdateNode.publish(newValue, oldValue);
      if (!batchAlreadyInProgress) this.fieldset.finishBatchUpdate();
    }
  }
});

})(Monarch);
