constructor("Views.Application", View.Template, {
  content: function() { with(this.builder) {
    div({id: 'application_view'}, function() {
      h1("hyperarchy");
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
      History.on_change(function(path) {
        self.navigate(path);
      });

      Connection = new Strophe.Connection("/http-bind");

      Connection.addHandler(function(msg) {

        $(msg).find("item").each(function() {
          console.debug($(this).attr("name"));
        })

        console.debug(msg);
      });

      Connection.connect("nathan", "password", function(status) {
        if (status == Strophe.Status.CONNECTING) {
          console.log('Strophe is connecting.');
        } else if (status == Strophe.Status.CONNFAIL) {
          console.log('Strophe failed to connect.');
          $('#connect').get(0).value = 'connect';
        } else if (status == Strophe.Status.DISCONNECTING) {
          console.log('Strophe is disconnecting.');
        } else if (status == Strophe.Status.DISCONNECTED) {
          console.log('Strophe is disconnected.');
          $('#connect').get(0).value = 'connect';
        } else if (status == Strophe.Status.CONNECTED) {
          console.log('Strophe is connected.');
          Connection.send($pres());
          Connection.send($iq({type: "get"}).c("query", {xmlns: Strophe.NS.DISCO_ITEMS}));
        }
      });
    },

    navigate: function(path) {
      switch(path) {
        case "":
          this.elections_view.hide();
          this.signup_view.hide();
          this.login_view.show();
          break;
        case "signup":
          this.elections_view.hide();
          this.login_view.hide();
          this.signup_view.show();
          break;
        case "elections":
          this.login_view.hide();
          this.signup_view.hide();
          this.elections_view.show();
          break;
      }
    },

    current_user_id_established: function(current_user_id) {
      this.current_user_id = current_user_id;

    }
  }
});
