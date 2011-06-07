//= require monarch_spec_helper

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Promise!!", function() {
    var promise, callback;

    before(function() {
      promise = new Monarch.Promise();
      callback = mockFunction('callback');
    });

    describe("#onSuccess", function() {
      context("when success has not been triggered on the promise", function() {
        it("registers the callback to be fired when it is", function() {
          promise.onSuccess(callback)
          promise.triggerSuccess('foo');
          expect(callback).to(haveBeenCalled, withArgs('foo'));
        });
      });

      context("when success has already been triggered on the promise", function() {
        before(function() {
          promise.triggerSuccess('foo');
        });

        it("fires the callback immediately with the value that with which success was triggered", function() {
          promise.onSuccess(callback)
          expect(callback).to(haveBeenCalled, withArgs('foo'));
        });
      });
    });

    describe("#onError", function() {
      context("when error has not been triggered on the promise", function() {
        it("registers the callback to be fired when it is", function() {
          promise.onError(callback)
          promise.triggerError('foo');
          expect(callback).to(haveBeenCalled, withArgs('foo'));
        });
      });

      context("when error has already been triggered on the promise", function() {
        before(function() {
          promise.triggerError('foo');
        });

        it("fires the callback immediately with the value that with which error was triggered", function() {
          promise.onError(callback)
          expect(callback).to(haveBeenCalled, withArgs('foo'));
        });
      });
    });

    describe("#onInvalid", function() {
      context("when invalid has not been triggered on the promise", function() {
        it("registers the callback to be fired when it is", function() {
          promise.onInvalid(callback)
          promise.triggerInvalid('foo');
          expect(callback).to(haveBeenCalled, withArgs('foo'));
        });
      });

      context("when invalid has already been triggered on the promise", function() {
        before(function() {
          promise.triggerInvalid('foo');
        });

        it("fires the callback immediately with the value that with which invalid was triggered", function() {
          promise.onInvalid(callback)
          expect(callback).to(haveBeenCalled, withArgs('foo'));
        });
      });
    });
  });
}});
