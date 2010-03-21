(function(Monarch) {

_.constructor("Monarch.Http.AjaxFuture", {
  initialize: function() {
    this.onSuccessNode = new Monarch.SubscriptionNode();
    this.beforeEventsNode = new Monarch.SubscriptionNode();
    this.afterEventsNode = new Monarch.SubscriptionNode();
    this.onFailureNode = new Monarch.SubscriptionNode();
    this.onCompleteNode = new Monarch.SubscriptionNode();
  },

  handleResponse: function(response) {
    if (!response) throw new Error("respones is null");
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

  onSuccess: function(callback, context) {
    if (this.triggered) {
      if (this.successful) callback.call(context, this.data);
    } else {
      this.onSuccessNode.subscribe(callback, context);
    }
    return this;
  },

  onFailure: function(callback, context) {
    if (this.triggered) {
      if (!this.successful) callback.call(context, this.data);
    } else {
      this.onFailureNode.subscribe(callback, context);
    }
    return this;
  },

  onComplete: function(callback, context) {
    if (this.triggered) {
      callback.call(context, this.data);
    } else {
      this.onCompleteNode.subscribe(callback, context);
    }
    return this;
  },

  beforeEvents: function(callback, context) {
    if (this.triggered) {
      if (this.repositoryUpdated) callback.call(context, this.data);
    } else {
      this.beforeEventsNode.subscribe(callback, context);
    }
    return this;
  },

  afterEvents: function(callback, context) {
    if (this.triggered) {
      if (this.repositoryUpdated) callback.call(context, this.data);
    } else {
      this.afterEventsNode.subscribe(callback, context);
    }
    return this;
  }
});

})(Monarch);
