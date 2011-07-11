(function(Monarch) {

_.constructor("Monarch.Http.AjaxFuture", {
  initialize: function() {
    this.successNode = new Monarch.SubscriptionNode();
    this.beforeEventsNode = new Monarch.SubscriptionNode();
    this.afterEventsNode = new Monarch.SubscriptionNode();
    this.onFailureNode = new Monarch.SubscriptionNode();
    this.errorNode = new Monarch.SubscriptionNode();
    this.onCompleteNode = new Monarch.SubscriptionNode();
    this.subscriptionNodes = [
      this.successNode, this.beforeEventsNode, this.afterEventsNode, this.onFailureNode, this.onCompleteNode
    ];
  },

  chain: function(otherFuture) {
    _.each(this.subscriptionNodes, function(node, index) {
      node.chain(otherFuture.subscriptionNodes[index]);
    });
  },

  handleResponse: function(response) {
    if (!response) throw new Error("response is null");
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

  triggerSuccess: function(/*data...*/) {
    var data = _.toArray(arguments);

    this.triggered = true;
    this.successful = true;
    this.data = data;
    this.beforeEventsNode.publishArgs(data);
    this.afterEventsNode.publishArgs(data);
    this.successNode.publishArgs(data);
    this.onCompleteNode.publishArgs(data);
  },

  updateRepositoryAndTriggerCallbacks: function(/* data..., repositoryOperation*/) {
    var data = _.toArray(arguments)
    var repositoryOperation = data.pop();

    this.triggered = true;
    this.repositoryUpdated = true;
    this.successful = true;
    this.data = data;

    Repository.pauseEvents();
    repositoryOperation();
    this.beforeEventsNode.publishArgs(data);
    Repository.resumeEvents();
    this.afterEventsNode.publishArgs(data);
    this.successNode.publishArgs(data);
    this.onCompleteNode.publishArgs(data);
  },
  
  triggerFailure: function(/*data...*/) {
    var data = _.toArray(arguments);

    this.triggered = true;
    this.failure = true;
    this.data = data;
    this.onFailureNode.publishArgs(data);
    this.onCompleteNode.publishArgs(data);
  },

  triggerError: function(xhr, status, errorThrown) {
    this.triggered = true;
    this.error = true;
    this.data = [xhr, status, errorThrown];
    this.errorNode.publish(xhr, status, errorThrown);
  },

  success: function(callback, context) {
    if (this.triggered) {
      if (this.successful) callback.apply(context, this.data);
    } else {
      this.successNode.subscribe(callback, context);
    }
    return this;
  },

  onFailure: function(callback, context) {
    if (this.triggered) {
      if (this.failure) callback.apply(context, this.data);
    } else {
      this.onFailureNode.subscribe(callback, context);
    }
    return this;
  },

  error: function(errorCallback, context) {
    if (this.triggered) {
      if (this.error) errorCallback.apply(context, this.data);
    } else {
      this.errorNode.subscribe(errorCallback);
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
