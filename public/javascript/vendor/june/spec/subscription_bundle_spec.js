require("/specs/june_spec_helper");

Screw.Unit(function(c) { with(c) {
  describe("SubscriptionBundle", function() {

    var bundle;
    before(function() {
      bundle = new June.SubscriptionBundle();
    });

    describe("#destroy_all", function() {
      it("#destroys all Subscriptions which have been added and clears the list", function() {
        subscription_1 = new June.Subscription();
        subscription_2 = new June.Subscription();
        mock(subscription_1, 'destroy');
        mock(subscription_2, 'destroy');

        bundle.add(subscription_1);
        bundle.add(subscription_2);

        expect(bundle.subscriptions).to_not(be_empty);
        bundle.destroy_all();
        expect(subscription_1.destroy).to(have_been_called);
        expect(subscription_2.destroy).to(have_been_called);
        expect(bundle.subscriptions).to(be_empty);
      });
    });

    describe("#subscription_count", function() {
      it("returns the number of Subscriptions added", function() {
        bundle.add(new June.Subscription());
        expect(bundle.subscription_count()).to(equal, 1);
        bundle.add(new June.Subscription());
        expect(bundle.subscription_count()).to(equal, 2);
      });
    });

    describe("#is_empty", function() {
      it("returns true if #subscription_count is 0 and false otherwise", function() {
        expect(bundle.is_empty()).to(be_true);
        bundle.add(new June.Subscription());
        expect(bundle.is_empty()).to(be_false);
      });
    });
  });
}});