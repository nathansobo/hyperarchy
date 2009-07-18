constructor("Views.Application", View.Template, {
  content: function() { with(this.builder) {
    div({id: 'application_view'}, function() {
      h1("Hyperarchy");
      subview('elections_view', Views.Elections);
      subview('login_view', Views.Login);
      subview('signup_view', Views.Signup);
    });
  }},

  view_properties: {
    initialize: function() {
      var self = this;
      this.elections_view.hide();
      this.signup_view.hide();
      window.Application = this;
      jQuery.history.init(function(path) {
        self.navigate(path);
      });
    },

    navigate: function(path) {
      switch(path) {
        case "":
          this.elections_view.hide();
          this.login_view.show();
          this.signup_view.hide();
          break;
        case "signup":
          this.elections_view.hide();
          this.login_view.hide();
          this.signup_view.show();
          break;
        case "elections":
          this.elections_view.show();
          this.login_view.hide();
          this.signup_view.hide();
          break;
      }
    },

    post: function(url, data) {
      var future = new AjaxFuture();
      jQuery.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        data: data,
        success: function(response) {
          future.handle_response(response);
        }
      });
      return future;
    }
  }
});