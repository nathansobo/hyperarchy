//= require "../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("AjaxFuture", function() {
    var future;

    before(function() {
      future = new AjaxFuture();
    });

    describe("#handle_response", function() {
      context("when the 'successful' key is true in the given response", function() {
        it("invokes success callbacks  and does not invoke failure callbacks", function() {
          var success_callback = mock_function("success callback");
          var failure_callback = mock_function("failure callback");
          future.on_success(success_callback);
          future.on_failure(failure_callback);

          var data = { foo: "bar" };
          future.handle_response({
            successful: true,
            data: data
          });

          expect(success_callback).to(have_been_called, with_args(data));
          expect(failure_callback).to_not(have_been_called);
        });
      });

      context("when the 'successful' key is false in the given response", function() {
        it("invokes failure callbacks and does not invoke success callbacks", function() {
          var success_callback = mock_function("success callback");
          var failure_callback = mock_function("failure callback");
          future.on_success(success_callback);
          future.on_failure(failure_callback);

          var data = { foo: "bar" };
          future.handle_response({
            success: false,
            data: data
          });

          expect(failure_callback).to(have_been_called, with_args(data));
          expect(success_callback).to_not(have_been_called);
        });
      });
    });

    describe("#on_success and #on_failure", function() {
      they("return the future object for method chaining", function() {
        expect(future.on_success(mock_function())).to(equal, future);
        expect(future.on_failure(mock_function())).to(equal, future);
      });

      context("when #handle_response has already been called with a successful response", function() {
        var data;
        before(function() {
          data = { foo: "bar" };
          future.handle_response({
            successful: true,
            data: data
          });
        });

        it("invokes an #on_success callback immediately with the response's data", function() {
          var success_callback = mock_function("success callback");
          future.on_success(success_callback);
          expect(success_callback).to(have_been_called, with_args(data));
        });

        it("does not invoke an #on_failure callback", function() {
          var failure_callback = mock_function("failure callback");
          future.on_failure(failure_callback);
          expect(failure_callback).to_not(have_been_called);
        });
      });

      context("when #handle_response has already been called with a unsuccessful response", function() {
        var data;
        before(function() {
          data = { foo: "bar" };
          future.handle_response({
            successful: false,
            data: data
          });
        });

        it("invokes an #on_failure callback immediately with the response's data", function() {
          var failure_callback = mock_function("failure callback");
          future.on_failure(failure_callback);
          expect(failure_callback).to(have_been_called, with_args(data));
        });

        it("does not invoke an #on_success callback", function() {
          var success_callback = mock_function("success callback");
          future.on_success(success_callback);
          expect(success_callback).to_not(have_been_called);
        });
      });
    });
  });
}});
