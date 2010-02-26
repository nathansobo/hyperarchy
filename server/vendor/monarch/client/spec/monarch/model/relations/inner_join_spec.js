//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Relations.Selection", function() {
    use_local_fixtures();

    var user, blog_1, blog_2, post_1, post_2, post_3;
    var join, left_operand, right_operand, predicate;

    before(function() {
      user = User.local_create({id: 'saltpeter', full_name: "Salt Peter"});
      blog_1 = user.blogs().local_create({id: 'blog_1'});
      blog_2 = user.blogs().local_create({id: 'blog_2'});
      post_1 = blog_1.blog_posts().local_create({id: 'post_1', body: "this is post 1"});
      post_2 = blog_1.blog_posts().local_create({id: 'post_2', body: "this is post 2"});
      post_3 = blog_2.blog_posts().local_create({id: 'post_3', body: "this is post 3"});
      Server.save(user, blog_1, blog_2, post_1, post_2, post_3);
      
      left_operand = user.blogs();
      right_operand = BlogPost.table;
      predicate = BlogPost.blog_id.eq(Blog.id);
      join = new Monarch.Model.Relations.InnerJoin(left_operand, right_operand, predicate);
    });

    describe("#all_tuples", function() {
      it("returns all composite tuples from the cartesian product of the operands that match the predicate", function() {
        var all_tuples = join.all_tuples();

        expect(all_tuples.length).to(equal, 3);

        expect(Monarch.Util.any(all_tuples, function(tuple) {
          return tuple.record(Blog.table) === blog_1 && tuple.record(BlogPost.table) === post_1;
        })).to(be_true);

        expect(Monarch.Util.any(all_tuples, function(tuple) {
          return tuple.record(Blog.table) === blog_1 && tuple.record(BlogPost.table) === post_2;
        })).to(be_true);

        expect(Monarch.Util.any(all_tuples, function(tuple) {
          return tuple.record(Blog.table) === blog_2 && tuple.record(BlogPost.table) === post_3;
        })).to(be_true);
      });
    });

    describe("#wire_representation", function() {
      it("returns the JSON representation of the Selection", function() {
        it("returns the JSON representation of the InnerJoin", function() {
          expect(join.wire_representation()).to(equal, {
            type: "inner_join",
            left_operand: {
              type: "set",
              name: "blogs"
            },
            right_operand: {
              type: "set",
              name: "blog_posts"
            },
            predicate: {
              type: "eq",
              left_operand: {
                type: "attribute",
                set: "blog_posts",
                name: "blog_id"
              },
              right_operand: {
                type: "attribute",
                set: "blogs",
                name: "id"
              }
            }
          });
        });
      });
    });

    describe("#column", function() {
      it("returns the first matching column from either operand", function() {
        expect(join.column('name')).to(equal, Blog.name_);
        expect(join.column('body')).to(equal, BlogPost.body);
      });
    });

    describe("#on_remote_insert", function() {
      it("returns a Monarch.Subscription with #on_remote_insert_node as its #node", function() {
        var subscription = join.on_remote_insert(function() {});
        expect(subscription.node).to(equal, join.on_remote_insert_node);
      });
    });

    describe("#on_remote_update", function() {
      it("returns a Monarch.Subscription with #on_remote_update_node as its #node", function() {
        var subscription = join.on_remote_update(function() {});
        expect(subscription.node).to(equal, join.on_remote_update_node);
      });
    });

    describe("#on_remote_remove", function() {
      it("returns a Monarch.Subscription with #on_remote_remove_node as its #node", function() {
        var subscription = join.on_remote_remove(function() {});
        expect(subscription.node).to(equal, join.on_remote_remove_node);
      });
    });

    describe("#has_subscribers", function() {
      context("if a callback has been registered with #on_remote_insert", function() {
        it("returns true", function() {
          join.on_remote_insert(function() {});
          expect(join.has_subscribers()).to(be_true);
        });
      });

      context("if a callback has been registered with #on_remote_remove", function() {
        it("returns true", function() {
          join.on_remote_remove(function() {});
          expect(join.has_subscribers()).to(be_true);
        });
      });

      context("if a callback has been registered with #on_remote_update", function() {
        it("returns true", function() {
          join.on_remote_update(function() {});
          expect(join.has_subscribers()).to(be_true);
        });
      });

      context("if no callbacks have been registered", function() {
        it("returns false", function() {
          expect(join.has_subscribers()).to(be_false);
        });
      });
    });

    describe("event handling", function() {
      var insert_handler, remove_handler, update_handler;
      before(function() {
        insert_handler = mock_function("insert handler");
        join.on_remote_insert(insert_handler, function(composite_tuple) {
          expect(join.contains(composite_tuple)).to(be_true);
        });

        remove_handler = mock_function("remove handler");
        join.on_remote_remove(remove_handler, function(composite_tuple) {
          expect(join.contains(composite_tuple)).to(be_false);
        });

        update_handler = mock_function("update handler");
        join.on_remote_update(update_handler, function(composite_tuple) {
          expect(join.contains(composite_tuple)).to(be_true);
        });
      });

      describe("insertion events on operands", function() {
        context("when a tuple is inserted into the left operand", function() {
          context("when the insertion causes #cartesean_product to contain a new CompositeTuple that matches the predicate", function() {
            it("triggers #on_remote_insert handlers with the new CompositeTuple", function() {
              var blog_post;

              BlogPost.create({ id: 'fofo', blog_id: 'blog_3'}).after_events(function(record) {
                blog_post = record;
              });

              user.blogs().create({id: "blog_3"}).after_events(function(blog) {
                expect(insert_handler).to(have_been_called, once);
                var composite_tuple = insert_handler.most_recent_args[0];
                expect(composite_tuple.left_tuple).to(equal, blog);
                expect(composite_tuple.right_tuple).to(equal, blog_post);
              });
            });
          });

          context("when the insertion does NOT cause #cartesean_product to contain a new CompositeTuple that matches the predicate", function() {
            it("does not trigger #on_remote_insert handlers or modify the contents of join", function() {
              var size_before_blog_create = join.size();
              user.blogs().create().after_events(function() {
                expect(insert_handler).to_not(have_been_called);
                expect(join.size()).to(equal, size_before_blog_create);
              });
            });
          });
        });

        context("when a tuple is inserted into the right operand", function() {
          context("when the insertion causes #cartesean_product to contain a new CompositeTuple that matches the predicate", function() {
            it("triggers #on_remote_insert handlers with the new CompositeTuple", function() {
              blog_1.blog_posts().create().after_events(function(blog_post) {
                expect(insert_handler).to(have_been_called, once);
                var composite_tuple = insert_handler.most_recent_args[0];
                expect(composite_tuple.left_tuple).to(equal, blog_1);
                expect(composite_tuple.right_tuple).to(equal, blog_post);
              });
            });
          });

          context("when the insertion does NOT cause #cartesean_product to contain a new CompositeTuple that matches the predicate", function() {
            it("does not trigger #on_remote_insert handlers", function() {
              BlogPost.create();
              expect(insert_handler).to_not(have_been_called);
            });

            it("does not modify the contents of #all_tuples", function() {
              var num_tuples_before_insertion = join.all_tuples().length;
              BlogPost.create();
              expect(join.all_tuples().length).to(equal, num_tuples_before_insertion);
            });
          });
        });
      });

      describe("removal events on operands", function() {
        context("when a tuple is removed from the left operand", function() {
          context("when the removal causes the removal of a CompositeTuple from #cartesean_product that matched #predicate", function() {
            it("triggers #on_remote_remove handlers with the removed CompositeTuple", function() {
              blog_2.destroy();

              expect(remove_handler).to(have_been_called, once);
              var removed_composite_tuple = remove_handler.most_recent_args[0];
              expect(removed_composite_tuple.left_tuple).to(equal, blog_2);
              expect(removed_composite_tuple.right_tuple).to(equal, post_3);
            });
          });

          context("when the removal does not cause the removal of any CompositeTuples from #cartesean_product that match #predicate", function() {
            it("does not trigger #on_remote_remove handlers or modify the contents of the relation", function() {
              var size_before = join.size();
              user.blogs().create().after_events(function(blog) {
                blog.destroy();
              })
              expect(remove_handler).to_not(have_been_called);
              expect(join.size()).to(equal, size_before);
            });
          });
        });

        context("when a tuple is removed from the right operand", function() {
          context("when the removal causes the removal of a CompositeTuple from #cartesean_product that matched #predicate", function() {
            it("triggers #on_remote_remove handlers with the removed CompositeTuple", function() {
              post_3.destroy();
              expect(remove_handler).to(have_been_called, once);
              var removed_composite_tuple = remove_handler.most_recent_args[0];
              expect(removed_composite_tuple.left_tuple).to(equal, blog_2);
              expect(removed_composite_tuple.right_tuple).to(equal, post_3);
            });
          });

          context("when the removal does not cause the removal of any CompositeTuples from #cartesean_product that match #predicate", function() {
            it("does not trigger #on_remote_remove handlers or modify the contents of the relation", function() {
              var size_before = join.size();
              BlogPost.create().after_events(function(post) {
                post.destroy();
              });
              expect(remove_handler).to_not(have_been_called);
              expect(join.size()).to(equal, size_before);
            });
          });
        });
      });

      describe("update events on operands", function() {
        context("when a tuple is updated in the left operand", function() {
          context("when the updated tuple is the #left component of a CompositeTuple that is a member of #all before the update", function() {
            context("when the CompositeTuple continues to match #predicate after the update", function() {
              it("triggers only #on_remote_update handlers with the updated CompositeTuple and a changed attributes object and does not modify the contents of the relation", function() {
                var size_before = join.size();

                var old_value = blog_2.name();
                var new_value = "Railsnuts Racoon's daily beat";
                blog_2.name(new_value);
                Server.save(blog_2);
                expect(update_handler).to(have_been_called, once);
                expect(remove_handler).to_not(have_been_called);
                expect(insert_handler).to_not(have_been_called);

                var updated_tuple = update_handler.most_recent_args[0];
                var changed_attributes = update_handler.most_recent_args[1];

                expect(updated_tuple.left_tuple).to(equal, blog_2);
                expect(updated_tuple.right_tuple).to(equal, post_3);

                expect(changed_attributes.name.column).to(equal, Blog.name_);
                expect(changed_attributes.name.old_value).to(equal, old_value);
                expect(changed_attributes.name.new_value).to(equal, new_value);

                expect(join.size()).to(equal, size_before);
              });
            });

            context("when the CompositeTuple no longer matches #predicate after the update", function() {
              it("triggers only #on_remote_remove handlers with the updated CompositeTuple", function() {
                blog_2.update({id: "booboo"});
                expect(remove_handler).to(have_been_called, once);
                expect(remove_handler.most_recent_args[0].left_tuple).to(equal, blog_2);
                expect(remove_handler.most_recent_args[0].right_tuple).to(equal, post_3);
                expect(insert_handler).to_not(have_been_called);
                expect(update_handler).to_not(have_been_called);
              });
            });
          });

          context("when the updated tuple is not a component of a CompositeTuple that is a member of the relation before the update", function() {
            context("when the update causes #cartesean_product to contain a CompositeTuple that matches #predicate", function() {
              it("triggers only the #on_remote_insert handlers with the updated CompositeTuple", function() {
                var blog = user.blogs().local_create({id: 'junky'});
                var blog_post = BlogPost.local_create({blog_id: 'nice'});
                Server.save(blog, blog_post);

                blog.update({id: "nice"});
                expect(insert_handler).to(have_been_called, once);
                expect(update_handler).to_not(have_been_called);
                expect(remove_handler).to_not(have_been_called);

                var composite_tuple = insert_handler.most_recent_args[0];
                expect(composite_tuple.left_tuple).to(equal, blog);
                expect(composite_tuple.right_tuple).to(equal, blog_post);
              });
            });

            context("when the update does not cause #cartesean_product to contain a CompositeTuple that matches #predicate", function() {
              it("does not trigger any event handlers", function() {
                var blog = user.blogs().local_create({name: "Junkfood Diet"});
                blog.save();
                blog.update({name: "Healthfood Diet"});

                expect(insert_handler).to_not(have_been_called);
                expect(update_handler).to_not(have_been_called);
                expect(remove_handler).to_not(have_been_called);
              });
            });
          });
        });

        context("when a tuple is updated in the right operand", function() {
          context("when the updated tuple is the #right component of a CompositeTuple that is a member of the relation before the update", function() {
            context("when the CompositeTuple continues to match #predicate after the update", function() {
              it("triggers only #on_remote_update handlers with the updated CompositeTuple and does not modify the contents of the relation", function() {
                var size_before = join.size();

                var old_value = post_3.body();
                var new_value = "Today sucked mum.";
                post_3.update({ body: new_value });

                expect(update_handler).to(have_been_called, once);
                expect(insert_handler).to_not(have_been_called);
                expect(remove_handler).to_not(have_been_called);

                var updated_tuple = update_handler.most_recent_args[0];
                var changed_attributes = update_handler.most_recent_args[1];

                expect(updated_tuple.left_tuple).to(equal, blog_2);
                expect(updated_tuple.right_tuple).to(equal, post_3);
                expect(changed_attributes.body.column).to(equal, BlogPost.body);
                expect(changed_attributes.body.old_value).to(equal, old_value);
                expect(changed_attributes.body.new_value).to(equal, new_value);

                expect(join.size()).to(equal, size_before);
              });
            });

            context("when the CompositeTuple no longer matches #predicate after the update", function() {
              it("triggers only #on_remote_remove handlers with the updated CompositeTuple", function() {
                post_3.update({blog_id: 'guns'});

                expect(remove_handler).to(have_been_called, once);
                expect(insert_handler).to_not(have_been_called);
                expect(update_handler).to_not(have_been_called);
                expect(remove_handler.most_recent_args[0].left_tuple).to(equal, blog_2);
                expect(remove_handler.most_recent_args[0].right_tuple).to(equal, post_3);
              });
            });
          });

          context("when the updated tuple is not a part of a composite tuple in the relation before the update", function() {
            var post;

            before(function() {
              post = BlogPost.local_create({ blog_id: "homer", body: "PAIN!" });
              post.save();
            });

            context("when the update causes #cartesean_product to contain a composite tuple that matches #predicate", function() {
              it("triggers only #on_remote_insert handlers with the new CompositeTuple", function() {
                post.update({blog_id: "blog_2"});

                expect(insert_handler).to(have_been_called, once);
                expect(update_handler).to_not(have_been_called);
                expect(remove_handler).to_not(have_been_called);

                var composite_tuple = insert_handler.most_recent_args[0];
                expect(composite_tuple.left_tuple).to(equal, blog_2);
                expect(composite_tuple.right_tuple).to(equal, post);
              });
            });

            context("when the update does not cause the #cartesean_product to contain a composite tuple that matches #predicate", function() {
              it("does not trigger any event handlers", function() {
                post.update({ body: "Flabby flabby flabby why are you this way?"});
                expect(insert_handler).to_not(have_been_called);
                expect(update_handler).to_not(have_been_called);
                expect(remove_handler).to_not(have_been_called);
              });
            });
          });
        });

        context("when a tuple is updated in a way that should insert one CompositeTuple and remove another", function() {
          it("fires #on_remote_insert handlers for the inserted tuple and #on_remote_remove handlers for the removed one", function() {
            post_3.update({blog_id: 'blog_1'});

            expect(insert_handler).to(have_been_called, once);

            var inserted_tuple = insert_handler.most_recent_args[0];
            expect(inserted_tuple.left_tuple).to(equal, blog_1);
            expect(inserted_tuple.right_tuple).to(equal, post_3);


            expect(remove_handler).to(have_been_called, once);
            var removed_tuple = remove_handler.most_recent_args[0];
            expect(removed_tuple.left_tuple).to(equal, blog_2);
            expect(removed_tuple.right_tuple).to(equal, post_3);
          });
        });
      });
    });


    describe("subscription propagation", function() {
      describe("when a Monarch.Subscription is registered for the Selection, destroyed, and another Monarch.Subscription is registered", function() {
        var event_type;

        scenario("for on_remote_insert callbacks", function() {
          init(function() {
            event_type = "on_remote_insert";
          });
        });

        scenario("for on_remote_update callbacks", function() {
          init(function() {
            event_type = "on_remote_update";
          });
        });

        scenario("for on_remote_remove callbacks", function() {
          init(function() {
            event_type = "on_remote_remove";
          });
        });

        it("subscribes to its #operand and memoizes tuples, then unsubscribes and clears the memoization, then resubscribes and rememoizes", function() {
          expect(left_operand.has_subscribers()).to(be_false);
          expect(right_operand.has_subscribers()).to(be_false);

          expect(join._tuples).to(be_null);

          var subscription = join[event_type].call(join, function() {});

          expect(left_operand.has_subscribers()).to(be_true);
          expect(right_operand.has_subscribers()).to(be_true);

          expect(join._tuples).to_not(be_null);

          subscription.destroy();

          expect(left_operand.has_subscribers()).to(be_false);
          expect(right_operand.has_subscribers()).to(be_false);
          expect(join._tuples).to(be_null);

          join.on_remote_update(function() {});

          expect(left_operand.has_subscribers()).to(be_true);
          expect(right_operand.has_subscribers()).to(be_true);
          expect(join._tuples).to_not(be_null);
        });
      });
    });

    describe("#evaluate_in_repository(repository)", function() {
      it("returns the same Selection with its #operand evaluated in the repository", function() {
        var other_repo = Repository.clone_schema();
        var join_in_other_repo = join.evaluate_in_repository(other_repo);

        expect(join_in_other_repo.predicate).to(equal, join.predicate);
        expect(join_in_other_repo.left_operand.operand).to(equal, join.left_operand.operand.evaluate_in_repository(other_repo));
        expect(join_in_other_repo.left_operand.predicate).to(equal, join.left_operand.predicate);
        expect(join_in_other_repo.right_operand).to(equal, join.right_operand.evaluate_in_repository(other_repo));
      });
    });
  });
}});
