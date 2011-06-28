//= require monarch_spec_helper

Screw.Unit(function(c) { with(c) {
  describe("Monarch.SubscriptionNode", function() {

    var node;

    before(function() {
      node = new Monarch.SubscriptionNode();
    });

    describe("#publishForPromise", function() {
      var promise1, promise2;
      before(function() {

        promise1 = new Monarch.Promise();
        promise2 = new Monarch.Promise();

        callback1 = mockFunction("callback1", function() {
          return promise1;
        });
        callback2 = mockFunction("callback2", function() {
          return promise2;
        });

        node.subscribe(callback1);
        node.subscribe(callback2);
      });

      it("builds a promise that waits on the success of all promises returned by subscribed callbacks", function() {
        var combinedPromise = node.publishForPromise("foo");
        var successCallback = mockFunction("successCallback");
        combinedPromise.success(successCallback);

        expect(successCallback).toNot(haveBeenCalled);
        promise1.triggerSuccess();
        expect(successCallback).toNot(haveBeenCalled);
        promise2.triggerSuccess();
        expect(successCallback).to(haveBeenCalled);
      });
    });
  });
}});
