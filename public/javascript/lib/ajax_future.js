constructor("AjaxFuture", {
  initialize: function() {
    this.on_success_node = new June.SubscriptionNode();
    this.on_failure_node = new June.SubscriptionNode();
  },

  handle_response: function(response) {
    this.handled_response = response;
    if (response.successful) {
      this.on_success_node.publish(response.data);
    } else {
      this.on_failure_node.publish(response.data);
    }
  },

  on_success: function(success_callback) {
    if (this.handled_response) {
      if (this.handled_response.successful) success_callback(this.handled_response.data);
    } else {
      this.on_success_node.subscribe(success_callback);
    }
    return this;
  },

  on_failure: function(failure_callback) {
    if (this.handled_response) {
      if (!this.handled_response.successful) failure_callback(this.handled_response.data);
    } else {
      this.on_failure_node.subscribe(failure_callback);
    }
    return this;
  }
});