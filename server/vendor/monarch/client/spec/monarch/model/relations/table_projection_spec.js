//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Relations.TableProjection", function() {
    var projection, operand, user, blog_1, blog_2, post_1, post_2, post_3;
    use_example_domain_model();

    before(function() {
      user = User.local_create({id: 'saltpeter', full_name: "Salt Peter"});
      blog_1 = user.blogs().local_create({id: 'blog_1', name: "Blog 1"});
      blog_2 = user.blogs().local_create({id: 'blog_2', name: "Blog 2"});
      post_1 = blog_1.blog_posts().local_create({id: 'post_1', body: "this is post 1"});
      post_2 = blog_1.blog_posts().local_create({id: 'post_2', body: "this is post 2"});
      post_3 = blog_2.blog_posts().local_create({id: 'post_3', body: "this is post 3"});
      Server.save(user, blog_1, blog_2, post_1, post_2, post_3);

      operand = user.blogs().join(BlogPost).on(BlogPost.blog_id.eq(Blog.id));
      projection = new Monarch.Model.Relations.TableProjection(operand, Blog.table);
    });


    describe("#all_tuples", function() {
      it("returns all unique records corresponding to the projected table", function() {
        var all_tuples = projection.all_tuples();
        expect(all_tuples.length).to(equal, 2);
        expect(Monarch.Util.contains(all_tuples, blog_1)).to(be_true);
        expect(Monarch.Util.contains(all_tuples, blog_2)).to(be_true);
      });
    });

    describe("event handling", function() {

      var insert_callback, update_callback, remove_callback;

      before(function() {
        insert_callback = mock_function("insert_callback");
        update_callback = mock_function("update_callback");
        remove_callback = mock_function("remove_callback");
        projection.on_insert(insert_callback);
        projection.on_update(update_callback);
        projection.on_remove(remove_callback);
      });

      describe("when a tuple is inserted into the operand", function() {
        context("if the record corresponding to the projected table is NOT already present in the projection", function() {
          it("triggers on_insert callbacks with the record", function() {
            var blog = user.blogs().local_create({id: 'bloggo'});
            var post = blog.blog_posts().local_create();
            Server.save(blog, post);
            expect(insert_callback).to(have_been_called, once);
            expect(insert_callback).to(have_been_called, with_args(blog));
          });
        });

        context("if the record corresponding to the projected table is already present in the projection", function() {
          it("does not trigger an on insert callback", function() {
            blog_1.blog_posts().create();
            expect(insert_callback).to_not(have_been_called);
          });
        });
      });

      describe("when a record is updated in the operand", function() {
        context("if one of the updated columns is in the #projected_table", function() {
          it("triggers on_update callbacks with the record's corresponding projected record and the changed columns", function() {
            var old_value = blog_2.name();
            var new_value = "I feeeel good!";

            blog_2.update({name: new_value});

            expect(update_callback).to(have_been_called, once);
            expect(update_callback).to(have_been_called, with_args(blog_2, {
              name: {
                column: Blog.name_,
                old_value: old_value,
                new_value: new_value
              },
              fun_profit_name: {
                column: Blog.fun_profit_name,
                old_value: old_value + " for Fun and Profit",
                new_value: new_value + " for Fun and Profit"
              }
            }));
          });
        });

        context("if none of the updated columns are in #projected_columns", function() {
          it("does not trigger any callbacks", function() {
            post_1.update({body: "Monkeys everywhere... Not sure if I'll make it."});
            expect(update_callback).to_not(have_been_called);
          });
        });

        context("if the same update triggers multiple update events on the same record from the operand", function() {
          it("collapses those multiple redundant events into one event", function() {
            blog_1.update({name: "You Are So Stupid"});
            expect(update_callback).to(have_been_called, once);
          });
        });
      });

      describe("when a record is removed from the operand", function() {
        context("if there are NO other tuples in the operand with the same record as their projected component", function() {
          it("triggers on_remove callbacks with the removed record's corresponding projected record", function() {
            post_3.destroy();
            expect(remove_callback).to(have_been_called, with_args(blog_2));
          });
        });

        context("if there are other tuples in the operand with the same record as their projected component", function() {
          it("does not trigger on remove callbacks", function() {
            post_1.destroy();
            expect(remove_callback).to_not(have_been_called);
          });
        });
      });
    });

    describe("subscription propagation", function() {

    });
  });
}});
