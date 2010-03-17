(function(Monarch) {

Monarch.constructor("Monarch.Model.RemoteField", Monarch.Model.ConcreteField, {
  attrAccessors: ['localField'],

  initialize: function(fieldset, column) {
    this.fieldset = fieldset;
    this.column = column;
  },

  // private

  valueAssigned: function(newValue, oldValue) {
    this.fieldset.fieldUpdated(this, newValue, oldValue);
    if (this.fieldset.updateEventsEnabled && this.onUpdateNode) this.onUpdateNode.publish(newValue, oldValue)
    this.localField().updateEventsEnabled = false;
    this.localField().value(newValue);
    this.localField().markClean();
    this.localField().updateEventsEnabled = true;
  }
});

})(Monarch);
