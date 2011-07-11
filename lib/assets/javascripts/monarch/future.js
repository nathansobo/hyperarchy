(function(Monarch) {

_.constructor("Monarch.Future", {
  initialize: function() {
    this.onCompleteNode = new Monarch.SubscriptionNode();
  },

  onComplete: function(callback, context) {
    if (this.completed) {
      callback(this.value)
    } else {
      return this.onCompleteNode.subscribe(callback, context);
    }
  },

  propagateCompletion: function(future) {
    if (this.completed) {
      future.complete(this.value)
    } else {
      return this.onCompleteNode.subscribe(function(value) {
        future.complete(value);
      });
    }
  },

  complete: function(value) {
    this.completed = true;
    this.value = value;
    this.onCompleteNode.publish(value);
  }
});

})(Monarch);
