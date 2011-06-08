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
        it("registers the callback to be fired when it is", function() {
          promise.success(callback)
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
        it("registers the callback to be fired when it is", function() {
          promise.error(callback)
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
        it("registers the callback to be fired when it is", function() {
          promise.invalid(callback)
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
