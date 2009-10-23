//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Http.Server", function() {
    var server;

    before(function() {
      server = new Monarch.Http.Server();
    });

    describe("#create(relation, field_values)", function() {
      use_example_domain_model();
      use_fake_server();

      it("instantiates a record without inserting it, posts its field values to the remote repository, then updates the record with the returned field values, reinitializes its relations, and inserts it", function() {
        var insert_callback = mock_function("insert callback");
        var update_callback = mock_function("update callback");
        Blog.on_insert(insert_callback);
        Blog.on_update(update_callback);

        var field_values = { crazy_name: "Dinosaurs", user_id: 'wil' };
        var create_future = server.create(Blog.table, field_values);

        expect(Server.posts.length).to(equal, 1);
        var post = Server.posts.shift();
        expect(post.url).to(equal, Repository.origin_url);
        expect(post.data.relation).to(equal, Blog.table.wire_representation());
        expect(post.data.field_values).to(equal, new Blog(field_values).wire_representation());

        var before_events_callback = mock_function("before events", function() {
          expect(insert_callback).to_not(have_been_called);
        });
        var after_events_callback = mock_function("after events", function() {
          expect(insert_callback).to(have_been_called, once);
        });
        create_future.before_events(before_events_callback);
        create_future.after_events(after_events_callback);

        post.simulate_success({
          field_values: {
            id: "dinosaurs",
            name: "Recipes Modified By Server",
            user_id: "wil"
          }
        });
        
        expect(update_callback).to_not(have_been_called);
        expect(insert_callback).to(have_been_called, once);

        var new_record = Blog.find('dinosaurs');
        expect(new_record.name()).to(equal, "Recipes Modified By Server");
        expect(new_record.user_id()).to(equal, "wil");
        
        expect(new_record.blog_posts().predicate.right_operand).to(equal, new_record.id());
        
        expect(before_events_callback).to(have_been_called, with_args(new_record));
        expect(after_events_callback).to(have_been_called, with_args(new_record));
      });
    });

    describe("#update(record, field_values)", function() {
      use_local_fixtures();
      use_fake_server();

      it("performs a pending local update, then sends the changes to the server and commits the (potentially changed) field values from the result", function() {
        Repository.origin_url = "/repo";

        var record = Blog.find('recipes');
        record.fancy_name = function(plain_name) {
          this.name("Fancy " + plain_name);
        };

        var update_callback = mock_function("update callback");
        Blog.on_update(update_callback);

        var fun_profit_name_before_update = record.fun_profit_name();
        var name_before_update = record.name();
        var user_id_before_update = record.user_id();
        var started_at_before_update = record.started_at();
        var new_started_at = new Date();

        var update_future = server.update(record, {
          fancy_name: "Programming",
          user_id: 'wil',
          started_at: new_started_at
        });

        expect(record.fun_profit_name()).to(equal, fun_profit_name_before_update);
        expect(record.name()).to(equal, name_before_update);
        expect(record.user_id()).to(equal, user_id_before_update);
        expect(record.started_at()).to(equal, started_at_before_update);
        expect(update_callback).to_not(have_been_called);

        var before_events_callback = mock_function('before events callback', function() {
          expect(update_callback).to_not(have_been_called);
        });
        var after_events_callback = mock_function('after events callback', function() {
          expect(update_callback).to(have_been_called, with_args(record, {
            fun_profit_name: {
              column: Blog.fun_profit_name,
              old_value: fun_profit_name_before_update ,
              new_value: "Fancy Programming Prime for Fun and Profit"
            },
            name: {
              column: Blog.name,
              old_value: name_before_update,
              new_value: "Fancy Programming Prime"
            },
            user_id: {
              column: Blog.user_id,
              old_value: user_id_before_update,
              new_value: "wil"
            },
            started_at: {
              column: Blog.started_at,
              old_value: started_at_before_update,
              new_value: new_started_at
            }
          }));
        });
        update_future.before_events(before_events_callback);
        update_future.after_events(after_events_callback);

        expect(Server.puts.length).to(equal, 1);
        var put = Server.puts.shift();

        expect(put.url).to(equal, Repository.origin_url);
        expect(put.data.id).to(equal, record.id());
        expect(put.data.relation).to(equal, Blog.table.wire_representation());
        expect(put.data.field_values).to(equal, {
          name: "Fancy Programming",
          user_id: "wil",
          started_at: new_started_at.getTime()
        });

        put.simulate_success({
          field_values: {
            name: "Fancy Programming Prime", // server can change field values too
            user_id: 'wil',
            started_at: new_started_at.getTime()
          }
        });

        expect(record.name()).to(equal, "Fancy Programming Prime");
        expect(record.user_id()).to(equal, "wil");
        expect(record.started_at()).to(equal, new_started_at);

        expect(before_events_callback).to(have_been_called);
        expect(after_events_callback).to(have_been_called);
      });
    });

    describe("#destroy(record)", function() {
      use_local_fixtures();
      use_fake_server();

      it("sends the table and id of the record to be deleted to the remote repository, then destroys the local record on success", function() {
        var remove_callback = mock_function("remove callback");
        Blog.on_remove(remove_callback);

        var record = Blog.find('recipes');
        var destroy_future = server.destroy(record);

        expect(Server.deletes.length).to(equal, 1);
        var delete_request = Server.deletes.shift();
        expect(delete_request.url).to(equal, Repository.origin_url);
        expect(delete_request.data.relation).to(equal, record.table().wire_representation());
        expect(delete_request.data.id).to(equal, record.id());

        var before_events_callback = mock_function("before events", function() {
          expect(remove_callback).to_not(have_been_called);
        });
        var after_events_callback = mock_function("after events", function() {
          expect(remove_callback).to(have_been_called, once);
        });
        destroy_future.before_events(before_events_callback);
        destroy_future.after_events(after_events_callback);

        delete_request.simulate_success();

        expect(remove_callback).to(have_been_called, once);

        var deleted_record = Blog.find('recipes');
        expect(deleted_record).to(equal, null);

        expect(before_events_callback).to(have_been_called);
        expect(after_events_callback).to(have_been_called);
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

      scenario(".post(url, data)", function() {
        init(function() {
          request_method = 'post';
        });
      });

      scenario(".get(url, data)", function() {
        init(function() {
          request_method = 'get';
        });
      });

      scenario(".put(url, data)", function() {
        init(function() {
          request_method = 'put';
        });
      });

      scenario(".delete(url, data)", function() {
        init(function() {
          request_method = 'delete_';
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
        expect(ajax_options.type).to(equal, request_method.toUpperCase().replace("_", ""));
        expect(ajax_options.dataType).to(equal, 'json');

        // data is url-encoded and appended as params for delete requests
        if (request_method == "delete_") {
          expect(ajax_options.url).to(equal, '/users?' + jQuery.param(server.stringify_json_data(data)));
          expect(ajax_options.data).to(be_null);
        } else {
          expect(ajax_options.url).to(equal, '/users');
          expect(JSON.parse(ajax_options.data.foo)).to(equal, data.foo);
          expect(ajax_options.data.baz).to(equal, data.baz);
          expect(JSON.parse(ajax_options.data.corge)).to(equal, data.corge);
          expect(JSON.parse(ajax_options.data.grault)).to(equal, data.grault);
        }


        expect(future.constructor).to(equal, Monarch.Http.AjaxFuture);

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
