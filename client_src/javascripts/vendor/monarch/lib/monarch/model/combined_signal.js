(function(Monarch) {

_.constructor("Monarch.Model.CombinedSignal", {
  initialize: function(leftOperand, rightOperand, transformer) {
    this.leftOperand = leftOperand;
    this.rightOperand = rightOperand;
    this.transformer = transformer;
    this.onRemoteUpdateNode = new Monarch.SubscriptionNode();
    this.onLocalUpdateNode = new Monarch.SubscriptionNode();

    this.leftOperand.onRemoteUpdate(function(newValue, oldValue) {
      var oldValue = this.transformer(oldValue, this.rightOperand.remoteValue());
      var newValue = this.transformer(newValue, this.rightOperand.remoteValue());
      if (newValue !== oldValue) this.onRemoteUpdateNode.publish(newValue, oldValue);
    }, this);

    this.rightOperand.onRemoteUpdate(function(newValue, oldValue) {
      var oldValue = this.transformer(this.leftOperand.remoteValue(), oldValue);
      var newValue = this.transformer(this.leftOperand.remoteValue(), newValue);
      if (newValue !== oldValue) this.onRemoteUpdateNode.publish(newValue, oldValue);
    }, this);

    this.leftOperand.onLocalUpdate(function(newValue, oldValue) {
      var oldValue = this.transformer(oldValue, this.rightOperand.remoteValue());
      var newValue = this.transformer(newValue, this.rightOperand.remoteValue());
      if (newValue !== oldValue) this.onLocalUpdateNode.publish(newValue, oldValue);
    }, this);

    this.rightOperand.onLocalUpdate(function(newValue, oldValue) {
      var oldValue = this.transformer(this.leftOperand.remoteValue(), oldValue);
      var newValue = this.transformer(this.leftOperand.remoteValue(), newValue);
      if (newValue !== oldValue) this.onLocalUpdateNode.publish(newValue, oldValue);
    }, this);
  },

  localValue: function() {
    return this.transformer(this.leftOperand.localValue(), this.rightOperand.localValue());
  },

  remoteValue: function() {
    return this.transformer(this.leftOperand.remoteValue(), this.rightOperand.remoteValue());
  },

  onRemoteUpdate: function(callback, context) {
    return this.onRemoteUpdateNode.subscribe(callback, context);
  },

  onLocalUpdate: function(callback, context) {
    return this.onLocalUpdateNode.subscribe(callback, context);
  }
});

})(Monarch);
