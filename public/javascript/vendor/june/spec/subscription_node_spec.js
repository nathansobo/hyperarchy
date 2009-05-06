require("/specs/june_spec_helper");

Screw.Unit(function(c) { with(c) {
  describe("SubscriptionNode", function() {
    var node;
    before(function() {
      node = new June.SubscriptionNode();
    });

    describe("#subscribe", function() {
      it("returns a Subscription with the SubscriptionNode as its #node", function() {
        var subscription = node.subscribe(function() {});
        expect(subscription.node).to(equal, node);
      });
    });
    
    describe("#unsubscribe", function() {
      it("causes the given Subscription's #handler to no longer be triggered by #publish", function() {
        var handler = mock_function("subscription handler");

        var subscription = node.subscribe(handler);

        node.publish();
        expect(handler).to(have_been_called, once);

        node.unsubscribe(subscription);

        node.publish();
        expect(handler).to(have_been_called, once);
      });

      it("triggers handlers registered with #on_unsubscribe with the unsubscribed Subscription", function() {
        var handler = mock_function("unsubscribe handler");

        node.on_unsubscribe(handler);

        var subscription = node.subscribe(handler);
        node.unsubscribe(subscription);

        expect(handler).to(have_been_called, with_args(subscription));
      });
    });

    describe("#publish", function() {
      it("invokes functions registered with #subscribe", function() {
        var fn_1 = mock_function();
        var fn_2 = mock_function();

        node.subscribe(fn_1);
        node.subscribe(fn_2);

        node.publish("foo");
        expect(fn_1).to(have_been_called, with_args("foo"));
        expect(fn_2).to(have_been_called, with_args("foo"));

        node.publish("bar", "baz");
        expect(fn_1).to(have_been_called, with_args("bar", "baz"));
        expect(fn_2).to(have_been_called, with_args("bar", "baz"));
      });
    });

    describe("#is_empty", function() {
      context("when a subscription has been registered", function() {
        it("returns false", function() {
          node.subscribe(function() {});
          expect(node.is_empty()).to(be_false);
        });
      });

      context("when no subscriptions have been registered", function() {
        it("returns true", function() {
          expect(node.subscriptions).to(be_empty);
          expect(node.is_empty()).to(be_true);
        });
      });
    });
  });
}});