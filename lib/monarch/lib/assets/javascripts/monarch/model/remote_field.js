(function(Monarch) {

_.constructor("Monarch.Model.RemoteField", Monarch.Model.ConcreteField, {
  propertyAccessors: ['localField'],

  initialize: function(fieldset, column) {
    this.fieldset = fieldset;
    this.column = column;
  },

  // private

  valueAssigned: function(newValue, oldValue, version) {
    this.fieldset.fieldUpdated(this, newValue, oldValue);
    if (this.fieldset.updateEventsEnabled && this.onUpdateNode) this.onUpdateNode.publish(newValue, oldValue)

    var localField = this.localField();

    if (version && localField.version > version) return;
    localField.updateEventsEnabled = false;
    localField.value(newValue);
    localField.markClean();
    localField.updateEventsEnabled = true;
  }
});

})(Monarch);
