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

  size: function() {
    return this.subscriptions.length;
  },

  empty: function() {
    return this.size() == 0;
  }
});
