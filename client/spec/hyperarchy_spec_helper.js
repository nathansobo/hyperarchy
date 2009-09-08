//= require <application>

Screw.Unit(function(c) { with(c) {
  before(function() {
    Server.posts = [];
    Server.last_post = null;
    mock(Server, 'post', function(url, data) {
      var future = new AjaxFuture();
      var fake_post = {
        url: url,
        data: data,
        simulate_success: function(data) {
          future.handle_response({
            successful: true,
            data: data
          });
        },
        simulate_failure: function(data) {
          future.handle_response({
            successful: false,
            data: data
          });
        }
      };
      this.last_post = fake_post;
      this.posts.push(fake_post);
      return future;
    });

    window.Application = {
      navigate: function() {
        throw new Error("Mock this function in spec");
      },

      current_user_id_established: function() {
        throw new Error("Mock this function in spec");
      }
    }
  });

  after(function() {
    delete window['Application'];
  });

  c.define_model_fixtures = function() {
    before(function() {
      ModuleSystem.constructor("Animal", Model.Record);
      Animal.columns({
        name: "string",
        species_id: "string"
      });
    });

    after(function() {
      delete window['Animal'];
    });
  };
}});

