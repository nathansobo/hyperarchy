(function(Monarch) {

Monarch.constructor("Monarch.Model.SyntheticField", Monarch.Model.Field, {
  initialize: function(fieldset, column, signal) {
    this.fieldset = fieldset;
    this.local = (fieldset instanceof Monarch.Model.LocalFieldset);
    this.signal = signal;
    this.column = column;
    this.subscribeToFieldUpdates();
  },

  value: function(value) {
    if (arguments.length == 0) {
      return this.local ? this.signal.localValue() : this.signal.remoteValue();
    } else if (this.column.setter) {
      this.column.setter.call(this.fieldset.record, value);
    } else {
      throw new Error("No setter method defined on the synthetic column " + this.column.name);
    }
  },

  // private

  subscribeToFieldUpdates: function() {
    var updateHandler = function(newValue, oldValue) {
      this.fieldset.fieldUpdated(this, newValue, oldValue);
      if (this.fieldset.updateEventsEnabled && this.onUpdateNode) this.onUpdateNode.publish(newValue, oldValue);
    }.bind(this)

    if (this.local) {
      this.signal.onLocalUpdate(updateHandler);
    } else {
      this.signal.onRemoteUpdate(updateHandler);
    }
  }
});

})(Monarch);
