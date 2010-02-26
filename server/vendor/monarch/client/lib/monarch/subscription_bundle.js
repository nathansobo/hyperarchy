(function(Monarch) {

Monarch.constructor("Monarch.SubscriptionBundle", {
  initialize: function() {
    this.subscriptions = [];
  },

  add: function(subscription) {
    this.subscriptions.push(subscription);
  },

  add_all: function(subscriptions) {
    this.subscriptions.push.apply(this.subscriptions, subscriptions);
  },

  destroy_all: function() {
    Monarch.Util.each(this.subscriptions, function(subscription) {
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
