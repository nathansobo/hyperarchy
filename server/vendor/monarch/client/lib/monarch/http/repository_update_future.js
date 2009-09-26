constructor("Http.RepositoryUpdateFuture", {
  initialize: function() {
    this.before_events_node = new SubscriptionNode();
    this.after_events_node = new SubscriptionNode();
  },

  trigger_before_events: function() {
    this.triggered_before_events = true;
    this.before_events_node.publish();
  },

  trigger_after_events: function() {
    this.triggered_after_events = true;
    this.after_events_node.publish();
  },

  before_events: function(callback) {
    if (this.triggered_before_events) {
      callback();
    } else {
      this.before_events_node.subscribe(callback);
    }
    return this;
  },

  after_events: function(callback) {
    if (this.triggered_after_events) {
      callback();
    } else {
      this.after_events_node.subscribe(callback);
    }
    return this;
  }
});
