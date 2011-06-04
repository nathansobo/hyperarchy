(function(Monarch) {

_.constructor("Monarch.Promise", {
  initialize: function() {
    this.successNode = new Monarch.SubscriptionNode();
    this.invalidNode = new Monarch.SubscriptionNode();
    this.errorNode = new Monarch.SubscriptionNode();
  },

  onSuccess: function(fn, context) {
    this.successNode.subscribe(fn, context);
  },

  onInvalid: function(fn, context) {
    this.invalidNode.subscribe(fn, context);
  },

  onError: function(fn, context) {
    this.errorNode.subscribe(fn, context);
  },

  onComplete: function(fn, context) {
    this.successNode.subscribe(fn, context);
    this.errorNode.subscribe(fn, context);
  },

  triggerSuccess: function() {
    this.successNode.publishArgs(arguments);
  },

  triggerInvalid: function() {
    this.invalidNode.publishArgs(arguments);
  },

  triggerError: function() {
    this.errorNode.publishArgs(arguments);
  }
});

})(Monarch);