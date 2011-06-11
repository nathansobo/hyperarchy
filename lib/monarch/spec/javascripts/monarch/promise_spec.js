//= require monarch_spec_helper

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Promise!!", function() {
    var promise, callback;

    before(function() {
      promise = new Monarch.Promise();
      callback = mockFunction('callback');
    });

    describe("#success", function() {
      context("when success has not been triggered on the promise", function() {
        it("registers the callback to be fired when success is triggerred and returns the promise", function() {
          expect(promise.success(callback)).to(eq, promise);
          promise.triggerSuccess('foo');
          expect(callback).to(haveBeenCalled, withArgs('foo'));
        });
      });

      context("when success has already been triggered on the promise", function() {
        before(function() {
          promise.triggerSuccess('foo');
        });

        it("fires the callback immediately with the value that with which success was triggered", function() {
          promise.success(callback)
          expect(callback).to(haveBeenCalled, withArgs('foo'));
        });
      });
    });

    describe("#error", function() {
      context("when error has not been triggered on the promise", function() {
        it("registers the callback to be fired when error is triggerred and returns the promise", function() {
          expect(promise.error(callback)).to(eq, promise);
          promise.triggerError('foo');
          expect(callback).to(haveBeenCalled, withArgs('foo'));
        });
      });

      context("when error has already been triggered on the promise", function() {
        before(function() {
          promise.triggerError('foo');
        });

        it("fires the callback immediately with the value that with which error was triggered", function() {
          promise.error(callback)
          expect(callback).to(haveBeenCalled, withArgs('foo'));
        });
      });
    });

    describe("#invalid", function() {
      context("when invalid has not been triggered on the promise", function() {
        it("registers the callback to be fired when invalid is triggerred and returns the promise", function() {
          expect(promise.invalid(callback)).to(eq, promise);
          promise.triggerInvalid('foo');
          expect(callback).to(haveBeenCalled, withArgs('foo'));
        });
      });

      context("when invalid has already been triggered on the promise", function() {
        before(function() {
          promise.triggerInvalid('foo');
        });

        it("fires the callback immediately with the value that with which invalid was triggered", function() {
          promise.invalid(callback)
          expect(callback).to(haveBeenCalled, withArgs('foo'));
        });
      });
    });
  });
}});
