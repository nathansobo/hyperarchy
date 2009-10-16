(function(Monarch) {

Monarch.constructor("Monarch.Http.AjaxFuture", {
  initialize: function() {
    this.on_success_node = new Monarch.SubscriptionNode();
    this.on_failure_node = new Monarch.SubscriptionNode();
  },

  handle_response: function(response) {
    if (response.successful) {
      this.trigger_success(response.data);
    } else {
      this.trigger_failure(response.data);
    }
  },

  trigger_success: function(data) {
    this.triggered = true;
    this.successful = true;
    this.data = data;
    this.on_success_node.publish(data);
  },

  trigger_failure: function(data) {
    this.triggered = true;
    this.successful = false;
    this.data = data;
    this.on_failure_node.publish(data);
  },

  on_success: function(success_callback) {
    if (this.triggered) {
      if (this.successful) success_callback(this.data);
    } else {
      this.on_success_node.subscribe(success_callback);
    }
    return this;
  },

  on_failure: function(failure_callback) {
    if (this.triggered) {
      if (!this.successful) failure_callback(this.data);
    } else {
      this.on_failure_node.subscribe(failure_callback);
    }
    return this;
  }
});

})(Monarch);
