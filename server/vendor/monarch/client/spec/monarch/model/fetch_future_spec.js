//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Http.RepositoryUpdateFuture", function() {
    var future, event_type;

    before(function() {
      future = new Monarch.Http.RepositoryUpdateFuture();
    });

    scenario("#before_events", function() {
      init(function() {
        event_type = 'before_events'
      });
    });

    scenario("#after_events", function() {
      init(function() {
        event_type = 'after_events'
      });
    });

    context("when the event has not been triggered", function() {
      it("registers the given callback to be invoked when it is triggered", function() {
        var callback = mock_function("callback");
        future[event_type].call(future, callback);

        expect(callback).to_not(have_been_called);

        future["trigger_" + event_type].call(future);
        expect(callback).to(have_been_called, once);
      });
    });

    context("when the event has already been triggered", function() {
      it("invokes the given callback immediately", function() {
        future["trigger_" + event_type].call(future);

        var callback = mock_function("callback");
        future[event_type].call(future, callback);
        expect(callback).to(have_been_called, once);
      });
    });
  });
}});
