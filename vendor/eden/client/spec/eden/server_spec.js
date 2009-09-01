//= require "../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Server", function() {
    describe(".post", function() {
      before(function() {
        Server.post = Server.post.original_function;
      });

      it("calls jQuery.ajax with request type 'post', returning an AjaxFuture whose #handle_response method is called upon receiving a response", function() {
        mock(jQuery, 'ajax');

        var data = {
          full_name: "Snoop Dogg",
          password: "shiznit",
          email_address: "snoop21@aol.com"
        };
        var future = Server.post("/users", data);
        expect(jQuery.ajax).to(have_been_called, once);

        var ajax_options = jQuery.ajax.most_recent_args[0];
        expect(ajax_options.url).to(equal, '/users');
        expect(ajax_options.type).to(equal, 'POST');
        expect(ajax_options.dataType).to(equal, 'json');
        expect(ajax_options.data).to(equal, data);

        expect(future.constructor).to(equal, AjaxFuture);

        mock(future, 'handle_response');

        var response_json = {
          success: true,
          data: {
            foo: "bar"
          }
        };
        ajax_options.success(response_json);
        expect(future.handle_response).to(have_been_called, with_args(response_json));
      });
    });
  });
}});