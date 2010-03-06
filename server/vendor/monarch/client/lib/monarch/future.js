(function(Monarch) {

Monarch.constructor("Monarch.Future", {
  initialize: function() {
    this.onCompleteNode = new Monarch.SubscriptionNode();
  },

  onComplete: function(callback) {
    if (this.completed) {
      callback(this.value)
    } else {
      return this.onCompleteNode.subscribe(callback);
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
