(function(Monarch) {

Monarch.constructor("Monarch.Http.AjaxFuture", {
  initialize: function() {
    this.onSuccessNode = new Monarch.SubscriptionNode();
    this.beforeEventsNode = new Monarch.SubscriptionNode();
    this.afterEventsNode = new Monarch.SubscriptionNode();
    this.onFailureNode = new Monarch.SubscriptionNode();
    this.onCompleteNode = new Monarch.SubscriptionNode();
  },

  handleResponse: function(response) {
    if (response.successful) {
      if (response.dataset) {
        this.updateRepositoryAndTriggerCallbacks(response.data, function() {
          Repository.update(response.dataset);
        });
      } else {
        this.triggerSuccess(response.data);
      }
    } else {
      this.triggerFailure(response.data);
    }
  },

  triggerSuccess: function(data) {
    this.triggered = true;
    this.successful = true;
    this.data = data;
    this.onSuccessNode.publish(data);
    this.onCompleteNode.publish(data);
  },

  updateRepositoryAndTriggerCallbacks: function(data, repositoryOperation) {
    this.triggered = true;
    this.repositoryUpdated = true;
    this.successful = true;
    this.data = data;

    Repository.pauseEvents();
    repositoryOperation();
    this.beforeEventsNode.publish(data);
    Repository.resumeEvents();
    this.afterEventsNode.publish(data);
    this.onSuccessNode.publish(data);
    this.onCompleteNode.publish(data);
  },
  
  triggerFailure: function(data) {
    this.triggered = true;
    this.successful = false;
    this.data = data;
    this.onFailureNode.publish(data);
    this.onCompleteNode.publish(data);
  },

  onSuccess: function(callback) {
    if (this.triggered) {
      if (this.successful) callback(this.data);
    } else {
      this.onSuccessNode.subscribe(callback);
    }
    return this;
  },

  onFailure: function(callback) {
    if (this.triggered) {
      if (!this.successful) callback(this.data);
    } else {
      this.onFailureNode.subscribe(callback);
    }
    return this;
  },

  onComplete: function(callback) {
    if (this.triggered) {
      callback(this.data);
    } else {
      this.onCompleteNode.subscribe(callback);
    }
    return this;
  },

  beforeEvents: function(callback) {
    if (this.triggered) {
      if (this.repositoryUpdated) callback(this.data);
    } else {
      this.beforeEventsNode.subscribe(callback);
    }
    return this;
  },

  afterEvents: function(callback) {
    if (this.triggered) {
      if (this.repositoryUpdated) callback(this.data);
    } else {
      this.afterEventsNode.subscribe(callback);
    }
    return this;
  }
});

})(Monarch);
