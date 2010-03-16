//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Http.AjaxFuture", function() {
    var future;

    before(function() {
      future = new Monarch.Http.AjaxFuture();
    });

    describe("#handleResponse", function() {
      context("when the 'successful' key is true in the given response and it also (optionally) includes a dataset", function() {
        useExampleDomainModel();

        context("when the response also includes records", function() {
          it("invokes success callbacks with the response's 'data' hash after updating the repository with the dataset and does not invoke failure callbacks", function() {
            var insertCallback = mockFunction("create callback");
            User.onRemoteInsert(insertCallback);

            var beforeEventsCallback = mockFunction("before events callback", function() {
              expect(User.find('stephanie').fullName()).to(equal, "Stephanie Wambach");
              expect(insertCallback).toNot(haveBeenCalled);
            });

            var afterEventsCallback = mockFunction("after events callback", function() {
              expect(insertCallback).to(haveBeenCalled);
            });

            var successCallback = mockFunction("success callback", function() {
              expect(afterEventsCallback).to(haveBeenCalled);
              expect(User.find('stephanie').fullName()).to(equal, "Stephanie Wambach");
            });

            var failureCallback = mockFunction("failure callback");
            future.beforeEvents(beforeEventsCallback);
            future.afterEvents(afterEventsCallback);
            future.onSuccess(successCallback);
            future.onFailure(failureCallback);

            var data = { foo: "bar" };
            future.handleResponse({
              successful: true,
              data: data,
              dataset: {
                users: {
                  stephanie: { id: "stephanie", fullName: "Stephanie Wambach" }
                }
              }
            });

            expect(beforeEventsCallback).to(haveBeenCalled, withArgs(data));
            expect(afterEventsCallback).to(haveBeenCalled, withArgs(data));
            expect(successCallback).to(haveBeenCalled, withArgs(data));
            expect(failureCallback).toNot(haveBeenCalled);
          });
        });

        context("when the response does not include records", function() {
          it("invokes only success callbacks with the response's 'data' hash and does not invoke failure, beforeEvents, or afterEvents callbacks", function() {
            var beforeEventsCallback = mockFunction("before events callback");
            var afterEventsCallback = mockFunction("after events callback");
            var successCallback = mockFunction("success callback");
            var failureCallback = mockFunction("failure callback");

            future.beforeEvents(beforeEventsCallback);
            future.afterEvents(afterEventsCallback);
            future.onSuccess(successCallback);
            future.onFailure(failureCallback);

            var data = { foo: "bar" };
            future.handleResponse({
              successful: true,
              data: data
            });

            expect(successCallback).to(haveBeenCalled, withArgs(data));
            expect(beforeEventsCallback).toNot(haveBeenCalled);
            expect(afterEventsCallback).toNot(haveBeenCalled);
            expect(failureCallback).toNot(haveBeenCalled);
          });
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
