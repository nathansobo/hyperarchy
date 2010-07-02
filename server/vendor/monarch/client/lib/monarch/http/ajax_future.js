(function(Monarch) {

_.constructor("Monarch.Http.AjaxFuture", {
  initialize: function() {
    this.onSuccessNode = new Monarch.SubscriptionNode();
    this.beforeEventsNode = new Monarch.SubscriptionNode();
    this.afterEventsNode = new Monarch.SubscriptionNode();
    this.onFailureNode = new Monarch.SubscriptionNode();
    this.onErrorNode = new Monarch.SubscriptionNode();
    this.onCompleteNode = new Monarch.SubscriptionNode();
    this.subscriptionNodes = [
      this.onSuccessNode, this.beforeEventsNode, this.afterEventsNode, this.onFailureNode, this.onCompleteNode
    ];
  },

  chain: function(otherFuture) {
    _.each(this.subscriptionNodes, function(node, index) {
      node.chain(otherFuture.subscriptionNodes[index]);
    });
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
    this.failure = true;
    this.data = data;
    this.onFailureNode.publish(data);
    this.onCompleteNode.publish(data);
  },

  triggerError: function(xhr, status, errorThrown) {
    this.triggered = true;
    this.error = true;
    this.data = [xhr, status, errorThrown];
    this.onErrorNode.publish(xhr, status, errorThrown);
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
      if (this.failure) callback.call(context, this.data);
    } else {
      this.onFailureNode.subscribe(callback, context);
    }
    return this;
  },

  onError: function(errorCallback) {
    if (this.triggered) {
      if (this.error) errorCallback.apply(null, this.data);
    } else {
      this.onErrorNode.subscribe(errorCallback);
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
