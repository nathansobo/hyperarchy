(function(Monarch) {

Monarch.constructor("Monarch.Model.CombinedSignal", {
  initialize: function(leftOperand, rightOperand, transformer) {
    var self = this;

    this.leftOperand = leftOperand;
    this.rightOperand = rightOperand;
    this.transformer = transformer;
    this.onRemoteUpdateNode = new Monarch.SubscriptionNode();
    this.onLocalUpdateNode = new Monarch.SubscriptionNode();

    this.leftOperand.onRemoteUpdate(function(newValue, oldValue) {
      var oldValue = self.transformer(oldValue, self.rightOperand.remoteValue());
      var newValue = self.transformer(newValue, self.rightOperand.remoteValue());
      if (newValue !== oldValue) self.onRemoteUpdateNode.publish(newValue, oldValue);
    });

    this.rightOperand.onRemoteUpdate(function(newValue, oldValue) {
      var oldValue = self.transformer(self.leftOperand.remoteValue(), oldValue);
      var newValue = self.transformer(self.leftOperand.remoteValue(), newValue);
      if (newValue !== oldValue) self.onRemoteUpdateNode.publish(newValue, oldValue);
    });

    this.leftOperand.onLocalUpdate(function(newValue, oldValue) {
      var oldValue = self.transformer(oldValue, self.rightOperand.remoteValue());
      var newValue = self.transformer(newValue, self.rightOperand.remoteValue());
      if (newValue !== oldValue) self.onLocalUpdateNode.publish(newValue, oldValue);
    });

    this.rightOperand.onLocalUpdate(function(newValue, oldValue) {
      var oldValue = self.transformer(self.leftOperand.remoteValue(), oldValue);
      var newValue = self.transformer(self.leftOperand.remoteValue(), newValue);
      if (newValue !== oldValue) self.onLocalUpdateNode.publish(newValue, oldValue);
    });
  },

  localValue: function() {
    return this.transformer(this.leftOperand.localValue(), this.rightOperand.localValue());
  },

  remoteValue: function() {
    return this.transformer(this.leftOperand.remoteValue(), this.rightOperand.remoteValue());
  },

  onRemoteUpdate: function(callback) {
    return this.onRemoteUpdateNode.subscribe(callback);
  },

  onLocalUpdate: function(callback) {
    return this.onLocalUpdateNode.subscribe(callback);
  }
});

})(Monarch);
