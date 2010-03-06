//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Http.AjaxFuture", function() {
    var future;

    before(function() {
      future = new Monarch.Http.AjaxFuture();
    });

    describe("#handleResponse", function() {
      context("when the 'successful' key is true in the given response", function() {
        it("invokes success callbacks  and does not invoke failure callbacks", function() {
          var successCallback = mockFunction("success callback");
          var failureCallback = mockFunction("failure callback");
          future.onSuccess(successCallback);
          future.onFailure(failureCallback);

          var data = { foo: "bar" };
          future.handleResponse({
            successful: true,
            data: data
          });

          expect(successCallback).to(haveBeenCalled, withArgs(data));
          expect(failureCallback).toNot(haveBeenCalled);
        });
      });

      context("when the 'successful' key is false in the given response", function() {
        it("invokes failure callbacks and does not invoke success callbacks", function() {
          var successCallback = mockFunction("success callback");
          var failureCallback = mockFunction("failure callback");
          future.onSuccess(successCallback);
          future.onFailure(failureCallback);

          var data = { foo: "bar" };
          future.handleResponse({
            success: false,
            data: data
          });

          expect(failureCallback).to(haveBeenCalled, withArgs(data));
          expect(successCallback).toNot(haveBeenCalled);
        });
      });
    });

    describe("#onSuccess and #onFailure", function() {
      they("return the future object for method chaining", function() {
        expect(future.onSuccess(mockFunction())).to(equal, future);
        expect(future.onFailure(mockFunction())).to(equal, future);
      });

      context("when #handleResponse has already been called with a successful response", function() {
        var data;
        before(function() {
          data = { foo: "bar" };
          future.handleResponse({
            successful: true,
            data: data
          });
        });

        it("invokes an #onSuccess callback immediately with the response's data", function() {
          var successCallback = mockFunction("success callback");
          future.onSuccess(successCallback);
          expect(successCallback).to(haveBeenCalled, withArgs(data));
        });

        it("does not invoke an #onFailure callback", function() {
          var failureCallback = mockFunction("failure callback");
          future.onFailure(failureCallback);
          expect(failureCallback).toNot(haveBeenCalled);
        });
      });

      context("when #handleResponse has already been called with a unsuccessful response", function() {
        var data;
        before(function() {
          data = { foo: "bar" };
          future.handleResponse({
            successful: false,
            data: data
          });
        });

        it("invokes an #onFailure callback immediately with the response's data", function() {
          var failureCallback = mockFunction("failure callback");
          future.onFailure(failureCallback);
          expect(failureCallback).to(haveBeenCalled, withArgs(data));
        });

        it("does not invoke an #onSuccess callback", function() {
          var successCallback = mockFunction("success callback");
          future.onSuccess(successCallback);
          expect(successCallback).toNot(haveBeenCalled);
        });
      });
    });
  });
}});
