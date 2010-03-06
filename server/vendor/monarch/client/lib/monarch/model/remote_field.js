(function(Monarch) {

Monarch.constructor("Monarch.Model.RemoteField", Monarch.Model.ConcreteField, {
  initialize: function(fieldset, column) {
    this.fieldset = fieldset;
    this.column = column;
  },

  localField: function(localField) {
    if (arguments.length == 0) {
      return this.LocalField
    } else {
      return this.LocalField = localField;
    }
  },

  // private

  valueAssigned: function(newValue, oldValue) {
    this.fieldset.fieldUpdated(this, newValue, oldValue);
    if (this.fieldset.updateEventsEnabled && this.onUpdateNode) this.onUpdateNode.publish(newValue, oldValue)
    this.LocalField.updateEventsEnabled = false;
    this.LocalField.value(newValue);
    this.LocalField.markClean();
    this.LocalField.updateEventsEnabled = true;
  }
});

})(Monarch);
