module("June", function(c) { with(c) {
  constructor("SubscriptionBundle", function() {
    def('initialize', function() {
      this.subscriptions = [];
    });

    def('add', function(subscription) {
      this.subscriptions.push(subscription);
    });

    def('destroy_all', function() {
      June.each(this.subscriptions, function() {
        this.destroy();
      });
      this.subscriptions = [];
    });

    def('subscription_count', function() {
      return this.subscriptions.length;
    });

    def("is_empty", function() {
      return this.subscription_count() == 0;
    });
  });
}});