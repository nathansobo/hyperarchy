//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Http.RepositoryUpdateFuture", function() {
    var future, eventType;

    before(function() {
      future = new Monarch.Http.RepositoryUpdateFuture();
    });

    scenario("#beforeEvents", function() {
      init(function() {
        eventType = 'beforeEvents'
      });
    });

    scenario("#afterEvents", function() {
      init(function() {
        eventType = 'afterEvents'
      });
    });

    context("when the event has not been triggered", function() {
      it("registers the given callback to be invoked when it is triggered", function() {
        var callback = mockFunction("callback");
        future[eventType].call(future, callback);

        expect(callback).toNot(haveBeenCalled);

        future["trigger" + Monarch.Inflection.capitalize(eventType)].call(future);
        expect(callback).to(haveBeenCalled, once);
      });
    });

    context("when the event has already been triggered", function() {
      it("invokes the given callback immediately", function() {
        future["trigger" + Monarch.Inflection.capitalize(eventType)].call(future);

        var callback = mockFunction("callback");
        future[eventType].call(future, callback);
        expect(callback).to(haveBeenCalled, once);
      });
    });
  });
}});
