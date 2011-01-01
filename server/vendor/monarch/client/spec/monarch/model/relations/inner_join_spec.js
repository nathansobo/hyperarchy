//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Relations.InnerJoin", function() {
    useLocalFixtures();

    var user, blog1, blog2, post1, post2, post3;
    var join, leftOperand, rightOperand, predicate;

    before(function() {
      user = User.createFromRemote({id: 'saltpeter', fullName: "Salt Peter"});
      blog1 = user.blogs().createFromRemote({id: 'blog1'});
      blog2 = user.blogs().createFromRemote({id: 'blog2'});
      post1 = blog1.blogPosts().createFromRemote({id: 'post1', body: "this is post 1"});
      post2 = blog1.blogPosts().createFromRemote({id: 'post2', body: "this is post 2"});
      post3 = blog2.blogPosts().createFromRemote({id: 'post3', body: "this is post 3"});

      leftOperand = user.blogs();
      rightOperand = BlogPost.table;
      predicate = BlogPost.blogId.eq(Blog.id);
      join = new Monarch.Model.Relations.InnerJoin(leftOperand, rightOperand, predicate);
    });

    describe("#tuples", function() {
      it("returns all composite tuples from the cartesian product of the operands that match the predicate", function() {
        var tuples = join.tuples();

        expect(tuples.length).to(eq, 3);

        expect(_.any(tuples, function(tuple) {
          return tuple.record(Blog.table) === blog1 && tuple.record(BlogPost.table) === post1;
        })).to(beTrue);

        expect(_.any(tuples, function(tuple) {
          return tuple.record(Blog.table) === blog1 && tuple.record(BlogPost.table) === post2;
        })).to(beTrue);

        expect(_.any(tuples, function(tuple) {
          return tuple.record(Blog.table) === blog2 && tuple.record(BlogPost.table) === post3;
        })).to(beTrue);
      });
    });

    describe("#wireRepresentation", function() {
      it("returns the JSON representation of the Selection", function() {
        it("returns the JSON representation of the InnerJoin", function() {
          expect(join.wireRepresentation()).to(equal, {
            type: "innerJoin",
            leftOperand: {
              type: "set",
              name: "blogs"
            },
            rightOperand: {
              type: "set",
              name: "blogPosts"
            },
            predicate: {
              type: "eq",
              leftOperand: {
                type: "attribute",
                set: "blogPosts",
                name: "blogId"
              },
              rightOperand: {
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
        expect(join.column('name')).to(eq, Blog.name_);
        expect(join.column('body')).to(eq, BlogPost.body);
      });
    });

    describe("event handling", function() {
      var insertHandler, removeHandler, updateHandler;
      before(function() {
        insertHandler = mockFunction("insert handler");
        join.onInsert(insertHandler, function(compositeTuple) {
          expect(join.contains(compositeTuple)).to(beTrue);
        });

        removeHandler = mockFunction("remove handler");
        join.onRemove(removeHandler, function(compositeTuple) {
          expect(join.contains(compositeTuple)).to(beFalse);
        });

        updateHandler = mockFunction("update handler");
        join.onUpdate(updateHandler, function(compositeTuple) {
          expect(join.contains(compositeTuple)).to(beTrue);
        });
      });

      describe("insertion events on operands", function() {
        context("when a tuple is inserted into the left operand", function() {
          context("when the insertion causes #carteseanProduct to contain a new CompositeTuple that matches the predicate", function() {
            it("triggers #onInsert handlers with the new CompositeTuple", function() {
              var blogPost = BlogPost.createFromRemote({ id: 'fofo', blogId: 'blog3'});

              var blog = user.blogs().createFromRemote({id: "blog3"})
              expect(insertHandler).to(haveBeenCalled, once);
              var compositeTuple = insertHandler.mostRecentArgs[0];
              expect(compositeTuple.leftTuple).to(eq, blog);
              expect(compositeTuple.rightTuple).to(eq, blogPost);
            });
          });

          context("when the insertion does NOT cause #carteseanProduct to contain a new CompositeTuple that matches the predicate", function() {
            it("does not trigger #onInsert handlers or modify the contents of join", function() {
              var sizeBeforeBlogCreate = join.size();
              user.blogs().create().afterEvents(function() {
                expect(insertHandler).toNot(haveBeenCalled);
                expect(join.size()).to(eq, sizeBeforeBlogCreate);
              });
            });
          });
        });

        context("when a tuple is inserted into the right operand", function() {
          context("when the insertion causes #carteseanProduct to contain a new CompositeTuple that matches the predicate", function() {
            it("triggers #onInsert handlers with the new CompositeTuple", function() {
              var blogPost = blog1.blogPosts().createFromRemote()
              expect(insertHandler).to(haveBeenCalled, once);
              var compositeTuple = insertHandler.mostRecentArgs[0];
              expect(compositeTuple.leftTuple).to(eq, blog1);
              expect(compositeTuple.rightTuple).to(eq, blogPost);
            });
          });

          context("when the insertion does NOT cause #carteseanProduct to contain a new CompositeTuple that matches the predicate", function() {
            it("does not trigger #onInsert handlers", function() {
              BlogPost.create();
              expect(insertHandler).toNot(haveBeenCalled);
            });

            it("does not modify the contents of #tuples", function() {
              var numTuplesBeforeInsertion = join.tuples().length;
              BlogPost.create();
              expect(join.tuples().length).to(eq, numTuplesBeforeInsertion);
            });
          });
        });
      });

      describe("removal events on operands", function() {
        context("when a tuple is removed from the left operand", function() {
          context("when the removal causes the removal of a CompositeTuple from #carteseanProduct that matched #predicate", function() {
            it("triggers #onRemove handlers with the removed CompositeTuple", function() {
              blog2.destroy();

              expect(removeHandler).to(haveBeenCalled, once);
              var removedCompositeTuple = removeHandler.mostRecentArgs[0];
              expect(removedCompositeTuple.leftTuple).to(eq, blog2);
              expect(removedCompositeTuple.rightTuple).to(eq, post3);
            });
          });

          context("when the removal does not cause the removal of any CompositeTuples from #carteseanProduct that match #predicate", function() {
            it("does not trigger #onRemove handlers or modify the contents of the relation", function() {
              var sizeBefore = join.size();
              user.blogs().create().afterEvents(function(blog) {
                blog.destroy();
              })
              expect(removeHandler).toNot(haveBeenCalled);
              expect(join.size()).to(eq, sizeBefore);
            });
          });
        });

        context("when a tuple is removed from the right operand", function() {
          context("when the removal causes the removal of a CompositeTuple from #carteseanProduct that matched #predicate", function() {
            it("triggers #onRemove handlers with the removed CompositeTuple", function() {
              post3.destroy();
              expect(removeHandler).to(haveBeenCalled, once);
              var removedCompositeTuple = removeHandler.mostRecentArgs[0];
              expect(removedCompositeTuple.leftTuple).to(eq, blog2);
              expect(removedCompositeTuple.rightTuple).to(eq, post3);
            });
          });

          context("when the removal does not cause the removal of any CompositeTuples from #carteseanProduct that match #predicate", function() {
            it("does not trigger #onRemove handlers or modify the contents of the relation", function() {
              var sizeBefore = join.size();
              BlogPost.create().afterEvents(function(post) {
                post.destroy();
              });
              expect(removeHandler).toNot(haveBeenCalled);
              expect(join.size()).to(eq, sizeBefore);
            });
          });
        });
      });

      describe("update events on operands", function() {
        context("when a tuple is updated in the left operand", function() {
          context("when the updated tuple is the #left component of a CompositeTuple that is a member of #all before the update", function() {
            context("when the CompositeTuple continues to match #predicate after the update", function() {
              it("triggers only #onUpdate handlers with the updated CompositeTuple and a changed attributes object and does not modify the contents of the relation", function() {
                var sizeBefore = join.size();

                var oldValue = blog2.name();
                var newValue = "Railsnuts Racoon's daily beat";
                blog2.remotelyUpdated({name: newValue});
                
                expect(updateHandler).to(haveBeenCalled, once);
                expect(removeHandler).toNot(haveBeenCalled);
                expect(insertHandler).toNot(haveBeenCalled);

                var updatedTuple = updateHandler.mostRecentArgs[0];
                var changedAttributes = updateHandler.mostRecentArgs[1];

                expect(updatedTuple.leftTuple).to(eq, blog2);
                expect(updatedTuple.rightTuple).to(eq, post3);

                expect(changedAttributes.name.column).to(eq, Blog.name_);
                expect(changedAttributes.name.oldValue).to(eq, oldValue);
                expect(changedAttributes.name.newValue).to(eq, newValue);

                expect(join.size()).to(eq, sizeBefore);
              });
            });

            context("when the CompositeTuple no longer matches #predicate after the update", function() {
              it("triggers only #onRemove handlers with the updated CompositeTuple", function() {
                blog2.update({id: "booboo"});
                expect(removeHandler).to(haveBeenCalled, once);
                expect(removeHandler.mostRecentArgs[0].leftTuple).to(eq, blog2);
                expect(removeHandler.mostRecentArgs[0].rightTuple).to(eq, post3);
                expect(insertHandler).toNot(haveBeenCalled);
                expect(updateHandler).toNot(haveBeenCalled);
              });
            });
          });

          context("when the updated tuple is not a component of a CompositeTuple that is a member of the relation before the update", function() {
            context("when the update causes #carteseanProduct to contain a CompositeTuple that matches #predicate", function() {
              it("triggers only the #onInsert handlers with the updated CompositeTuple", function() {
                var blog = user.blogs().createFromRemote({id: 'junky'});
                var blogPost = BlogPost.createFromRemote({blogId: 'nice'});

                blog.update({id: "nice"});
                expect(insertHandler).to(haveBeenCalled, once);
                expect(updateHandler).toNot(haveBeenCalled);
                expect(removeHandler).toNot(haveBeenCalled);

                var compositeTuple = insertHandler.mostRecentArgs[0];
                expect(compositeTuple.leftTuple).to(eq, blog);
                expect(compositeTuple.rightTuple).to(eq, blogPost);
              });
            });

            context("when the update does not cause #carteseanProduct to contain a CompositeTuple that matches #predicate", function() {
              it("does not trigger any event handlers", function() {
                var blog = user.blogs().createFromRemote({name: "Junkfood Diet"});
                blog.save();
                blog.update({name: "Healthfood Diet"});

                expect(insertHandler).toNot(haveBeenCalled);
                expect(updateHandler).toNot(haveBeenCalled);
                expect(removeHandler).toNot(haveBeenCalled);
              });
            });
          });
        });

        context("when a tuple is updated in the right operand", function() {
          context("when the updated tuple is the #right component of a CompositeTuple that is a member of the relation before the update", function() {
            context("when the CompositeTuple continues to match #predicate after the update", function() {
              it("triggers only #onUpdate handlers with the updated CompositeTuple and does not modify the contents of the relation", function() {
                var sizeBefore = join.size();

                var oldValue = post3.body();
                var newValue = "Today sucked mum.";
                post3.update({ body: newValue });

                expect(updateHandler).to(haveBeenCalled, once);
                expect(insertHandler).toNot(haveBeenCalled);
                expect(removeHandler).toNot(haveBeenCalled);

                var updatedTuple = updateHandler.mostRecentArgs[0];
                var changedAttributes = updateHandler.mostRecentArgs[1];

                expect(updatedTuple.leftTuple).to(eq, blog2);
                expect(updatedTuple.rightTuple).to(eq, post3);
                expect(changedAttributes.body.column).to(eq, BlogPost.body);
                expect(changedAttributes.body.oldValue).to(eq, oldValue);
                expect(changedAttributes.body.newValue).to(eq, newValue);

                expect(join.size()).to(eq, sizeBefore);
              });
            });

            context("when the CompositeTuple no longer matches #predicate after the update", function() {
              it("triggers only #onRemove handlers with the updated CompositeTuple", function() {
                post3.update({blogId: 'guns'});

                expect(removeHandler).to(haveBeenCalled, once);
                expect(insertHandler).toNot(haveBeenCalled);
                expect(updateHandler).toNot(haveBeenCalled);
                expect(removeHandler.mostRecentArgs[0].leftTuple).to(eq, blog2);
                expect(removeHandler.mostRecentArgs[0].rightTuple).to(eq, post3);
              });
            });
          });

          context("when the updated tuple is not a part of a composite tuple in the relation before the update", function() {
            var post;

            before(function() {
              post = BlogPost.createFromRemote({ blogId: "homer", body: "PAIN!" });
              post.save();
            });

            context("when the update causes #carteseanProduct to contain a composite tuple that matches #predicate", function() {
              it("triggers only #onInsert handlers with the new CompositeTuple", function() {
                post.update({blogId: "blog2"});

                expect(insertHandler).to(haveBeenCalled, once);
                expect(updateHandler).toNot(haveBeenCalled);
                expect(removeHandler).toNot(haveBeenCalled);

                var compositeTuple = insertHandler.mostRecentArgs[0];
                expect(compositeTuple.leftTuple).to(eq, blog2);
                expect(compositeTuple.rightTuple).to(eq, post);
              });
            });

            context("when the update does not cause the #carteseanProduct to contain a composite tuple that matches #predicate", function() {
              it("does not trigger any event handlers", function() {
                post.update({ body: "Flabby flabby flabby why are you this way?"});
                expect(insertHandler).toNot(haveBeenCalled);
                expect(updateHandler).toNot(haveBeenCalled);
                expect(removeHandler).toNot(haveBeenCalled);
              });
            });
          });
        });

        context("when a tuple is updated in a way that should insert one CompositeTuple and remove another", function() {
          it("fires #onInsert handlers for the inserted tuple and #onRemove handlers for the removed one", function() {
            post3.update({blogId: 'blog1'});

            expect(insertHandler).to(haveBeenCalled, once);

            var insertedTuple = insertHandler.mostRecentArgs[0];
            expect(insertedTuple.leftTuple).to(eq, blog1);
            expect(insertedTuple.rightTuple).to(eq, post3);


            expect(removeHandler).to(haveBeenCalled, once);
            var removedTuple = removeHandler.mostRecentArgs[0];
            expect(removedTuple.leftTuple).to(eq, blog2);
            expect(removedTuple.rightTuple).to(eq, post3);
          });
        });
      });
    });


    describe("subscription propagation", function() {
      describe("when a Monarch.Subscription is registered for the Selection, destroyed, and another Monarch.Subscription is registered", function() {
        var eventType;

        scenario("for onInsert callbacks", function() {
          init(function() {
            eventType = "onInsert";
          });
        });

        scenario("for onUpdate callbacks", function() {
          init(function() {
            eventType = "onUpdate";
          });
        });

        scenario("for onRemove callbacks", function() {
          init(function() {
            eventType = "onRemove";
          });
        });

        it("subscribes to its #operand and memoizes tuples, then unsubscribes and clears the memoization, then resubscribes and rememoizes", function() {
          expect(leftOperand.hasSubscribers()).to(beFalse);
          expect(rightOperand.hasSubscribers()).to(beFalse);

          expect(join._tuples).to(beNull);

          var subscription = join[eventType].call(join, function() {});

          expect(leftOperand.hasSubscribers()).to(beTrue);
          expect(rightOperand.hasSubscribers()).to(beTrue);

          expect(join._tuples).toNot(beNull);

          subscription.destroy();

          expect(leftOperand.hasSubscribers()).to(beFalse);
          expect(rightOperand.hasSubscribers()).to(beFalse);
          expect(join._tuples).to(beNull);

          join.onUpdate(function() {});

          expect(leftOperand.hasSubscribers()).to(beTrue);
          expect(rightOperand.hasSubscribers()).to(beTrue);
          expect(join._tuples).toNot(beNull);
        });
      });
    });

    describe("#evaluateInRepository(repository)", function() {
      it("returns the same Selection with its #operand evaluated in the repository", function() {
        var otherRepo = Repository.cloneSchema();
        var joinInOtherRepo = join.evaluateInRepository(otherRepo);

        expect(joinInOtherRepo.predicate).to(eq, join.predicate);
        expect(joinInOtherRepo.leftOperand.operand).to(eq, join.leftOperand.operand.evaluateInRepository(otherRepo));
        expect(joinInOtherRepo.leftOperand.predicate).to(eq, join.leftOperand.predicate);
        expect(joinInOtherRepo.rightOperand).to(eq, join.rightOperand.evaluateInRepository(otherRepo));
      });
    });
  });
}});
