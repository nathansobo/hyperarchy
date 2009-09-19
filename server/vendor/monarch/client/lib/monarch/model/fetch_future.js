constructor("Model.FetchFuture", {
  initialize: function() {
    this.before_delta_events_node = new SubscriptionNode();
    this.after_delta_events_node = new SubscriptionNode();
  },

  trigger_before_delta_events: function() {
    this.triggered_before_delta_events = true;
    this.before_delta_events_node.publish();
  },

  trigger_after_delta_events: function() {
    this.triggered_after_delta_events = true;
    this.after_delta_events_node.publish();
  },

  before_delta_events: function(callback) {
    if (this.triggered_before_delta_events) {
      callback();
    } else {
      this.before_delta_events_node.subscribe(callback);
    }
    return this;
  },

  after_delta_events: function(callback) {
    if (this.triggered_after_delta_events) {
      callback();
    } else {
      this.after_delta_events_node.subscribe(callback);
    }
    return this;
  }
});
