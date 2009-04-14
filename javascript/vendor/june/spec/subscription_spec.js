require("/specs/june_spec_helper");

Screw.Unit(function(c) { with(c) {
  describe("Subscription", function() {
    var node, handler, subscription;
    before(function() {
      node = new June.SubscriptionNode();
      handler = mock_function("subscription handler");
      subscription = new June.Subscription(node, handler);
    });

    describe("#trigger", function() {
      it("applies the #handler to the given array of arguments", function() {
        subscription.trigger(["foo", "bar"]);
        expect(handler).to(have_been_called, with_args("foo", "bar"));
      });
    });

    describe("#destroy", function() {
      it("calls #unsubscribe on its #node with itself", function() {
        mock(node, 'unsubscribe');
        subscription.destroy();
        expect(node.unsubscribe).to(have_been_called, with_args(subscription));
      });
    });
  });
}});