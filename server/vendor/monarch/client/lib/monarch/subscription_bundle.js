(function(Monarch) {

_.constructor("Monarch.SubscriptionBundle", {
  initialize: function() {
    this.subscriptions = [];
  },

  add: function(subscription) {
    if (_.isArray(subscription)) {
      this.subscriptions.push.apply(this.subscriptions, subscription);
    } else {
      this.subscriptions.push(subscription);
    }
  },

  destroyAll: function() {
    _.each(this.subscriptions, function(subscription) {
      subscription.destroy();
    });
    this.subscriptions = [];
  },

  size: function() {
    return this.subscriptions.length;
  },

  empty: function() {
    return this.size() == 0;
  }
});

})(Monarch);
