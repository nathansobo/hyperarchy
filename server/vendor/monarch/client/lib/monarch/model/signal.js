(function(Monarch) {

Monarch.constructor("Monarch.Model.Signal", {
  initialize: function(localField, remoteField, optionalTransformer) {
    this.localField = localField;
    this.remoteField = remoteField;
    this.transformer = optionalTransformer;

    this.onLocalUpdateNode = new Monarch.SubscriptionNode();
    this.onRemoteUpdateNode = new Monarch.SubscriptionNode();

    this.localField.onUpdate(function(newValue, oldValue) {
      if (this.transformer) {
        newValue = this.transformer(newValue);
        oldValue = this.transformer(oldValue);
      }
      this.onLocalUpdateNode.publish(newValue, oldValue);
    }, this);

    this.remoteField.onUpdate(function(newValue, oldValue) {
      if (this.transformer) {
        newValue = this.transformer(newValue);
        oldValue = this.transformer(oldValue);
      }
      this.onRemoteUpdateNode.publish(newValue, oldValue);
    }, this);
  },

  localValue: function() {
    var value = this.localField.value();
    if (this.transformer) {
      return this.transformer(value);
    } else {
      return value;
    }
  },

  remoteValue: function() {
    var value = this.remoteField.value();
    if (this.transformer) {
      return this.transformer(value);
    } else {
      return value;
    }
  },

  onLocalUpdate: function(callback, context) {
    return this.onLocalUpdateNode.subscribe(callback, context);
  },

  onRemoteUpdate: function(callback, context) {
    return this.onRemoteUpdateNode.subscribe(callback, context);
  },

  combine: function(otherSignal, transformer) {
    return new Monarch.Model.CombinedSignal(this, otherSignal, transformer);
  }
});

})(Monarch);
