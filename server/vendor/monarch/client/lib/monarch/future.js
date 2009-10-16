(function(Monarch) {

Monarch.constructor("Monarch.Future", {
  initialize: function() {
    this.on_complete_node = new Monarch.SubscriptionNode();
  },

  on_complete: function(callback) {
    if (this.completed) {
      callback(this.value)
    } else {
      return this.on_complete_node.subscribe(callback);
    }
  },

  propagate_completion: function(future) {
    if (this.completed) {
      future.complete(this.value)
    } else {
      return this.on_complete_node.subscribe(function(value) {
        future.complete(value);
      });
    }
  },

  complete: function(value) {
    this.completed = true;
    this.value = value;
    this.on_complete_node.publish(value);
  }
});

})(Monarch);
