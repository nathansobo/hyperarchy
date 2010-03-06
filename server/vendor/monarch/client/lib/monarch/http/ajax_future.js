(function(Monarch) {

Monarch.constructor("Monarch.Http.AjaxFuture", {
  initialize: function() {
    this.onSuccessNode = new Monarch.SubscriptionNode();
    this.onFailureNode = new Monarch.SubscriptionNode();
  },

  handleResponse: function(response) {
    if (response.successful) {
      this.triggerSuccess(response.data);
    } else {
      this.triggerFailure(response.data);
    }
  },

  triggerSuccess: function(data) {
    this.triggered = true;
    this.successful = true;
    this.data = data;
    this.onSuccessNode.publish(data);
  },

  triggerFailure: function(data) {
    this.triggered = true;
    this.successful = false;
    this.data = data;
    this.onFailureNode.publish(data);
  },

  onSuccess: function(successCallback) {
    if (this.triggered) {
      if (this.successful) successCallback(this.data);
    } else {
      this.onSuccessNode.subscribe(successCallback);
    }
    return this;
  },

  onFailure: function(failureCallback) {
    if (this.triggered) {
      if (!this.successful) failureCallback(this.data);
    } else {
      this.onFailureNode.subscribe(failureCallback);
    }
    return this;
  }
});

})(Monarch);
