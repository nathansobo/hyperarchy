//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Relations.InnerJoin", function() {
    useExampleDomainModel();

    var user, blog1, blog2, post1, post2, post3;
    var join, leftOperand, rightOperand, predicate;

    init(function() {
      user = User.createFromRemote({id: 1, fullName: "Salt Peter"});
      blog1 = user.blogs().createFromRemote({id: 1, name: "A"});
      blog2 = user.blogs().createFromRemote({id: 2, name: "B"});
      post1 = blog1.blogPosts().createFromRemote({id: 1, body: "this is post 1"});
      post2 = blog1.blogPosts().createFromRemote({id: 2, body: "this is post 2"});
      post3 = blog2.blogPosts().createFromRemote({id: 3, body: "this is post 3"});

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
          context("when the insertion causes the cartesian product to contain a new composite tuple that matches the predicate", function() {
            it("triggers an insert event with the composite tuple", function() {
              var blogPost = BlogPost.createFromRemote({ id: 100, blogId: 100});

              var blog = user.blogs().createFromRemote({id: 100})
              expect(insertHandler).to(haveBeenCalled, once);

              var expectedCompositeTuple = new Monarch.Model.CompositeTuple(blog, blogPost);
              var sortKey = join.buildSortKey(expectedCompositeTuple);
              expect(insertHandler).to(haveBeenCalled, withArgs(expectedCompositeTuple, 3, sortKey, sortKey));
            });
          });

          context("when the insertion does NOT cause the cartesean product to contain a new composite tuple that matches the predicate", function() {
            it("does not trigger insert events handlers or modify the stored contents of the join", function() {
              var sizeBeforeBlogCreate = join.size();
              user.blogs().createFromRemote();
              expect(insertHandler).toNot(haveBeenCalled);
              expect(join.size()).to(eq, sizeBeforeBlogCreate);
            });
          });
        });

        context("when a tuple is inserted into the right operand", function() {
          context("when the insertion causes the cartesean product to contain a new composite tuple that matches the predicate", function() {
            it("triggers insert events with the new composite tuple", function() {
              var blogPost = blog1.blogPosts().createFromRemote({id: 100});
              expect(insertHandler).to(haveBeenCalled, once);

              var expectedCompositeTuple = new Monarch.Model.CompositeTuple(blog1, blogPost);
              var sortKey = join.buildSortKey(expectedCompositeTuple);
              expect(insertHandler).to(haveBeenCalled, withArgs(expectedCompositeTuple, 2, sortKey, sortKey));
            });
          });

          context("when the insertion does nOT cause the cartesean product to contain a new composite tuple that matches the predicate", function() {
            it("does not trigger insert events or modify the stored contents of tuples", function() {
              var numTuplesBeforeInsertion = join.tuples().length;
              BlogPost.create();
              expect(insertHandler).toNot(haveBeenCalled);
              expect(join.tuples().length).to(eq, numTuplesBeforeInsertion);
            });
          });
        });
      });

      describe("removal events on operands", function() {
        context("when a tuple is removed from the left operand", function() {
          context("when the removal causes the removal of a composite tuple that was previously in the join", function() {
            it("triggers a remove event with the removed composite tuple", function() {
              var expectedCompositeTuple = new Monarch.Model.CompositeTuple(blog2, blog2.blogPosts().first());
              var sortKey = join.buildSortKey(expectedCompositeTuple);

              blog2.destroy();

              expect(removeHandler).to(haveBeenCalled, withArgs(expectedCompositeTuple, 2, sortKey, sortKey));
            });
          });

          context("when the removal does not cause the removal of any composite tuples that were previously in the join", function() {
            it("does not trigger remove events or modify the contents of the relation", function() {
              var sizeBefore = join.size();
              var emptyBlog = user.blogs().createFromRemote();
              emptyBlog.destroy();
              expect(removeHandler).toNot(haveBeenCalled);
              expect(join.size()).to(eq, sizeBefore);
            });
          });
        });

        context("when a tuple is removed from the right operand", function() {
          context("when the removal causes the removal of a composite tuple that was previously in the join", function() {
            it("triggers a remove event with the removed composite tuple", function() {
              var expectedCompositeTuple = new Monarch.Model.CompositeTuple(blog2, post3);
              var sortKey = join.buildSortKey(expectedCompositeTuple);

              post3.destroy();

              expect(removeHandler).to(haveBeenCalled, withArgs(expectedCompositeTuple, 2, sortKey, sortKey));
            });
          });

          context("when the removal does not cause the removal of any composite tuples that were previously in the join", function() {
            it("does not trigger remove events or modify the contents of the relation", function() {
              var sizeBefore = join.size();
              var orphanPost = BlogPost.createFromRemote({id: 100});
              orphanPost.destroy();
              expect(removeHandler).toNot(haveBeenCalled);
              expect(join.size()).to(eq, sizeBefore);
            });
          });
        });
      });

      describe("update events on operands", function() {
        context("when a tuple is updated in the left operand", function() {
          context("when the updated tuple is part of a composite tuple that was in the join before the update", function() {
            context("when that composite tuple remains in the join after the update", function() {

              init(function() {
                leftOperand = user.blogs().orderBy('name asc');
                rightOperand = BlogPost.table;
                predicate = BlogPost.blogId.eq(Blog.id);
                join = new Monarch.Model.Relations.InnerJoin(leftOperand, rightOperand, predicate);
              });

              it("triggers only update events with the updated containing composite tuple", function() {
                var sizeBefore = join.size();

                blog1.remotelyUpdated({name: 'C'});
                
                expect(updateHandler).to(haveBeenCalled, twice);

                // update of first composite tuple
                var expectedCompositeTuple1 = new Monarch.Model.CompositeTuple(blog1, post1);
                expect(updateHandler.callArgs[0]).to(equal, [
                  expectedCompositeTuple1,
                  {
                    name: { column: Blog.name_, oldValue: "A", newValue: "C" },
                    funProfitName: { column: Blog.funProfitName, oldValue: "A for Fun and Profit", newValue: "C for Fun and Profit" }
                  },
                  2, 0, // new index, old index
                  { 'blogs.id': 1, 'blog_posts.id': 1, 'blogs.name': "C" }, // new sort key
                  { 'blogs.id': 1, 'blog_posts.id': 1, 'blogs.name': "A"} // old sort key
                ]);
                
                // update of second composite tuple
                var expectedCompositeTuple2 = new Monarch.Model.CompositeTuple(blog1, post2);
                expect(updateHandler.callArgs[1]).to(equal, [
                  expectedCompositeTuple2,
                  {
                    name: { column: Blog.name_, oldValue: "A", newValue: "C" },
                    funProfitName: { column: Blog.funProfitName, oldValue: "A for Fun and Profit", newValue: "C for Fun and Profit" }
                  },
                  2, 0, // new index, old index
                  { 'blogs.id': 1, 'blog_posts.id': 2, 'blogs.name': "C" }, // new sort key
                  { 'blogs.id': 1, 'blog_posts.id': 2, 'blogs.name': "A"} // old sort key
                ]);

                expect(removeHandler).toNot(haveBeenCalled);
                expect(insertHandler).toNot(haveBeenCalled);
                expect(join.size()).to(eq, sizeBefore);
              });
            });

            context("when the CompositeTuple no longer matches #predicate after the update", function() {
              it("triggers only #onRemove handlers with the updated CompositeTuple", function() {
                blog2.remotelyUpdated({id: "booboo"});
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
                var blog = user.blogs().createFromRemote({id: 100});
                var blogPost = BlogPost.createFromRemote({blogId: 101});

                blog.update({id: 101});
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
          context("when the updated tuple is part of a composite tuple that was in the join before the update", function() {
            context("when the updated tuple is part of a composite tuple that was in the join before the update", function() {
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
                post.update({blogId: blog2.id()});

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
            post3.update({blogId: blog1.id()});

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
