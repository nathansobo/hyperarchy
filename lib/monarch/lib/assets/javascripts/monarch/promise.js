(function(Monarch) {

_.constructor("Monarch.Promise", {
  initialize: function() {
    this.successNode = new Monarch.SubscriptionNode();
    this.invalidNode = new Monarch.SubscriptionNode();
    this.errorNode = new Monarch.SubscriptionNode();
  },

  success: function(fn, context) {
    if (this.successTriggerred) {
      fn.apply(context, this.data);
    } else {
      this.successNode.subscribe(fn, context);
    }
  },

  invalid: function(fn, context) {
    if (this.invalidTriggerred) {
      fn.apply(context, this.data);
    } else {
      this.invalidNode.subscribe(fn, context);
    }
  },

  error: function(fn, context) {
    if (this.errorTriggerred) {
      fn.apply(context, this.data);
    } else {
      this.errorNode.subscribe(fn, context);
    }
  },

  triggerSuccess: function() {
    this.successTriggerred = true;
    this.data = arguments;
    this.successNode.publishArgs(arguments);
  },

  triggerInvalid: function() {
    this.invalidTriggerred = true;
    this.data = arguments;
    this.invalidNode.publishArgs(arguments);
  },

  triggerError: function() {
    this.errorTriggerred = true;
    this.data = arguments;
    this.errorNode.publishArgs(arguments);
  }
});

})(Monarch);