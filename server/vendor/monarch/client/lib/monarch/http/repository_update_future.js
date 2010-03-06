(function(Monarch) {

Monarch.constructor("Monarch.Http.RepositoryUpdateFuture", {
  initialize: function() {
    this.beforeEventsNode = new Monarch.SubscriptionNode();
    this.afterEventsNode = new Monarch.SubscriptionNode();
    this.onFailureNode = new Monarch.SubscriptionNode();
    this.onCompleteNode = new Monarch.SubscriptionNode();
  },

  triggerBeforeEvents: function(data) {
    this.triggeredBeforeEvents = true;
    this.beforeEventsData = data;
    this.beforeEventsNode.publish(data);
  },

  triggerAfterEvents: function(data) {
    this.triggeredAfterEvents = true;
    this.afterEventsData = data;
    this.afterEventsNode.publish(data);
    this.triggerOnComplete(data);
  },

  triggerOnFailure: function(data) {
    this.triggeredOnFailure = true;
    this.failureData = data;
    this.onFailureNode.publish(data);
    this.triggerOnComplete(data);
  },

  triggerOnComplete: function(data) {
    this.triggeredOnComplete = true;
    this.completeData = data;
    this.onCompleteNode.publish(data);
  },

  beforeEvents: function(callback) {
    if (this.triggeredBeforeEvents) {
      callback(this.beforeEventsData);
    } else {
      this.beforeEventsNode.subscribe(callback);
    }
    return this;
  },

  afterEvents: function(callback) {
    if (this.triggeredAfterEvents) {
      callback(this.afterEventsData);
    } else {
      this.afterEventsNode.subscribe(callback);
    }
    return this;
  },

  onFailure: function(callback) {
    if (this.triggeredOnFailure) {
      callback(this.failureData);
    } else {
      this.onFailureNode.subscribe(callback);
    }
  },

  onComplete: function(callback) {
    if (this.triggeredOnComplete) {
      callback(this.completeData);
    } else {
      this.onCompleteNode.subscribe(callback);
    }
  }
});

})(Monarch);
