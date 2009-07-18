//= require <hyperarchy>

Screw.Unit(function(c) { with(c) {
  before(function() {
    window.Application = {
      navigate: function() {
        throw new Error("Mock this function in spec");
      },

      posts: [],
      last_post: null,
      post: function(url, data) {
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
      }
    }
  });

  after(function() {
    delete window['Application'];
  });
}});