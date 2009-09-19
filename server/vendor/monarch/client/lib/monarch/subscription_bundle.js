constructor("SubscriptionBundle", {
  initialize: function() {
    this.subscriptions = [];
  },

  add: function(subscription) {
    this.subscriptions.push(subscription);
  },

  destroy_all: function() {
    Util.each(this.subscriptions, function(subscription) {
      subscription.destroy();
    });
    this.subscriptions = [];
  },

  subscription_count: function() {
    return this.subscriptions.length;
  },

  is_empty: function() {
    return this.subscription_count() == 0;
  }
});
