//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Http.Server", function() {
    var server;

    before(function() {
      server = new Http.Server();
    });


    describe("#create(relation, field_values)", function() {
      use_example_domain_model();

      before(function() {
        server.posts = [];
        server.post = FakeServer.prototype.post;
      });

      it("calls #post with Repository.origin_url and json to create a Record with the given field values in the given Relation", function() {
        Repository.origin_url = "/users/steph/repository";
        var future = server.create(Blog.table, {name: 'Recipes'});
        expect(server.posts).to(have_length, 1);

        var post = server.posts.shift();
        expect(post.url).to(equal, "/users/steph/repository");
        expect(post.data).to(equal, {
          relation: Blog.table.wire_representation(),
          field_values: {name: 'Recipes'}
        });

        mock(future, 'handle_response');
        post.simulate_success({id: 'recipes', name: 'Recipes'});
      });
    });


    describe("#fetch(origin_url, relations)", function() {
      use_example_domain_model();
      use_fake_server();

      it("performs a GET to Repository.origin_url with the json to fetch the given Relations, then merges the results into the Repository with the delta events sandwiched by before_events and after_events callback triggers on the returned future", function() {
        Repository.origin_url = "/users/steph/repository"
        var future = server.fetch([Blog.table, User.table]);

        expect(Server.gets).to(have_length, 1);
        var get = Server.gets.shift();
        expect(get.url).to(equal, "/users/steph/repository");
        expect(get.data).to(equal, {
          relations: [Blog.table.wire_representation(), User.table.wire_representation()]
        });

        var dataset = {
          users: {
            nathan: {
              id: 'nathan',
              full_name: "Nathan Sobo"
            },
            wil: {
              id: 'wil',
              full_name: 'Wil Bierbaum'
            }
          },
          blogs: {
            metacircular: {
              id: 'metacircular',
              user_id: 'nathan',
              name: 'Metacircular'
            },
            canyonero: {
              id: 'canyonero',
              user_id: 'wil',
              name: 'Canyonero'
            }
          }
        };

        var events = [];

        future
          .before_events(function() {
            events.push('before_events');
          })
          .after_events(function() {
            events.push('after_events')
          });

        mock(Repository, 'pause_events', function() {
          events.push('Repository.pause_events')
        });

        mock(Repository, 'update', function() {
          events.push('Repository.update')
        });

        mock(Repository, 'resume_events', function() {
          events.push('Repository.resume_events')
        });

        get.simulate_success(dataset);

        expect(Repository.update).to(have_been_called, with_args(dataset));

        expect(events).to(equal, [
          'Repository.pause_events',
          'Repository.update',
          'before_events',
          'Repository.resume_events',
          'after_events'
        ]);
      });
    });

    describe("request methods", function() {
      var request_method;

      scenario(".post", function() {
        init(function() {
          request_method = 'post';
        });
      });

      scenario(".get", function() {
        init(function() {
          request_method = 'get';
        });
      });

      scenario(".put", function() {
        init(function() {
          request_method = 'put';
        });
      });

      it("calls jQuery.ajax with the correct request type, returning an AjaxFuture whose #handle_response method is called upon receiving a response", function() {
        mock(jQuery, 'ajax');

        var data = {
          foo: {
            bar: "baz",
            quux: 1
          },
          baz: "hello",
          corge: [1, 2],
          grault: 1
        };

        var future = server[request_method].call(server, "/users", data);

        expect(jQuery.ajax).to(have_been_called, once);

        var ajax_options = jQuery.ajax.most_recent_args[0];
        expect(ajax_options.url).to(equal, '/users');
        expect(ajax_options.type).to(equal, request_method.toUpperCase());
        expect(ajax_options.dataType).to(equal, 'json');


        expect(JSON.parse(ajax_options.data.foo)).to(equal, data.foo);
        expect(ajax_options.data.baz).to(equal, data.baz);
        expect(JSON.parse(ajax_options.data.corge)).to(equal, data.corge);
        expect(JSON.parse(ajax_options.data.grault)).to(equal, data.grault);

        expect(future.constructor).to(equal, Http.AjaxFuture);

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
