(function(Monarch) {

Monarch.constructor("Monarch.Http.RepositoryUpdateFuture", {
  initialize: function() {
    this.before_events_node = new Monarch.SubscriptionNode();
    this.after_events_node = new Monarch.SubscriptionNode();
    this.on_failure_node = new Monarch.SubscriptionNode();
    this.on_complete_node = new Monarch.SubscriptionNode();
  },

  trigger_before_events: function(data) {
    this.triggered_before_events = true;
    this.before_events_data = data;
    this.before_events_node.publish(data);
  },

  trigger_after_events: function(data) {
    this.triggered_after_events = true;
    this.after_events_data = data;
    this.after_events_node.publish(data);
    this.trigger_on_complete(data);
  },

  trigger_on_failure: function(data) {
    this.triggered_on_failure = true;
    this.failure_data = data;
    this.on_failure_node.publish(data);
    this.trigger_on_complete(data);
  },

  trigger_on_complete: function(data) {
    this.triggered_on_complete = true;
    this.complete_data = data;
    this.on_complete_node.publish(data);
  },

  before_events: function(callback) {
    if (this.triggered_before_events) {
      callback(this.before_events_data);
    } else {
      this.before_events_node.subscribe(callback);
    }
    return this;
  },

  after_events: function(callback) {
    if (this.triggered_after_events) {
      callback(this.after_events_data);
    } else {
      this.after_events_node.subscribe(callback);
    }
    return this;
  },

  on_failure: function(callback) {
    if (this.triggered_on_failure) {
      callback(this.failure_data);
    } else {
      this.on_failure_node.subscribe(callback);
    }
  },

  on_complete: function(callback) {
    if (this.triggered_on_complete) {
      callback(this.complete_data);
    } else {
      this.on_complete_node.subscribe(callback);
    }
  }
});

})(Monarch);
