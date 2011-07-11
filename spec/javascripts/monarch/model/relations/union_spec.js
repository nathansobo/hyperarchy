//= require monarch_spec_helper

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Relations.Union", function() {
    useExampleDomainModel();

    var leftOperand, rightOperand, union;
    before(function() {
      leftOperand = User.where({fullName: "John"});
      rightOperand = User.where({age: 32});
      union = new Monarch.Model.Relations.Union(leftOperand, rightOperand);
    });


    describe("#tuples", function() {
      it("returns the union tuples in the left operand and right operand", function() {
        var user1 = User.createFromRemote({id: 1, age: 22, fullName: "Mackrel"});
        var user2 = User.createFromRemote({id: 2, age: 32, fullName: "Jonie"});
        var user3 = User.createFromRemote({id: 3, age: 32, fullName: "John"});
        var user4 = User.createFromRemote({id: 4, fullName: "John"});
        var user5 = User.createFromRemote({id: 5, fullName: "Mark"});

        var tuples = union.tuples();
        expect(tuples.length).to(eq, 3);
        expect(_.include(tuples, user2)).to(beTrue);
        expect(_.include(tuples, user3)).to(beTrue);
        expect(_.include(tuples, user4)).to(beTrue);
      });
    });

    describe("event handling", function() {
      var user, blog, union, insertCallback, updateCallback, removeCallback;

      before(function() {
        user = User.createFromRemote({id: 1});
        blog = user.blogs().createFromRemote({id: 1});

        var leftOperand = user.blogPosts();
        var rightOperand = user.favoriteBlogPosts();
        union = leftOperand.union(rightOperand);

        insertCallback = mockFunction("insertCallback");
        updateCallback = mockFunction("updateCallback");
        removeCallback = mockFunction("removeCallback");
        union.onInsert(insertCallback);
        union.onUpdate(updateCallback);
        union.onRemove(removeCallback);
      });

      function expectNoCallbacksToHaveBeenCalled() {
        expect(insertCallback).toNot(haveBeenCalled);
        expect(updateCallback).toNot(haveBeenCalled);
        expect(removeCallback).toNot(haveBeenCalled);
      }

      function clearCallbackMocks() {
        insertCallback.clear();
        updateCallback.clear();
        removeCallback.clear();
      }

      describe("when a record is inserted in the left operand", function() {
        context("if the record is not present in the right operand", function() {
          it("triggers an insert event with the record", function() {
            var record = BlogPost.createFromRemote({id: 1, blogId: 1});
            var sortKey = union.buildSortKey(record);

            expect(insertCallback).to(haveBeenCalled, withArgs(record, 0, sortKey, sortKey));
            expect(updateCallback).toNot(haveBeenCalled);
            expect(removeCallback).toNot(haveBeenCalled);
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger an insert event", function() {
            var record = BlogPost.createFromRemote({id: 1, blogId: 2});
            user.favoritings().createFromRemote({blogPostId: 1});

            clearCallbackMocks();

            // update causes an insert into the user's blog post selection, but its already a favorite so no event
            record.remotelyUpdated({blogId: 1});

            expect(insertCallback).toNot(haveBeenCalled);
            // update callback gets called as an artifact of how we insert into the left operand
            expect(updateCallback).to(haveBeenCalled, once);
            expect(removeCallback).toNot(haveBeenCalled);
          });
        });
      });

      describe("when a record is inserted in the right operand", function() {
        context("if the record is not present in the left operand", function() {
          it("triggers an insert event with the record", function() {
            var record = BlogPost.createFromRemote({id: 1});
            var sortKey = union.buildSortKey(record);

            user.favoritings().createFromRemote({blogPostId: 1});
            expect(insertCallback).to(haveBeenCalled, withArgs(record, 0, sortKey, sortKey));
            expect(updateCallback).toNot(haveBeenCalled);
            expect(removeCallback).toNot(haveBeenCalled);
          });
        });

        context("if the record is present in the left operand", function() {
          it("does not trigger any callbacks", function() {
            var record = BlogPost.createFromRemote({id: 1, blogId: 1});
            clearCallbackMocks();
            
            user.favoritings().createFromRemote({blogPostId: 1});
            expectNoCallbacksToHaveBeenCalled();
          });
        });
      });

      describe("when a record is updated in the left operand", function() {
        context("if the record is not present in the right operand", function() {
          it("triggers an update event with the record", function() {
            var record = BlogPost.createFromRemote({id: 1, blogId: 1});
            var sortKey = union.buildSortKey(record);

            clearCallbackMocks();

            record.remotelyUpdated({name: "New Name"});
            expect(updateCallback).to(haveBeenCalled, once);
            expect(updateCallback.mostRecentArgs[0]).to(eq, record);
            // skip verification of changeset because it's a pain
            expect(updateCallback.mostRecentArgs[2]).to(eq, 0);
            expect(updateCallback.mostRecentArgs[3]).to(eq, 0);
            expect(updateCallback.mostRecentArgs[4]).to(equal, sortKey);
            expect(updateCallback.mostRecentArgs[5]).to(equal, sortKey);

            expect(insertCallback).toNot(haveBeenCalled);
            expect(removeCallback).toNot(haveBeenCalled);
          });
        });

        context("if the record is present in the right operand", function() {
          it("triggers an update event with the record, but not twice", function() {
            var record = BlogPost.createFromRemote({id: 1, blogId: 1});
            user.favoritings().createFromRemote({blogPostId: 1})
            clearCallbackMocks();

            record.update({name: "New Name"});
            expect(updateCallback).to(haveBeenCalled, once);
          });
        });
      });

      describe("when a record is removed from the left operand", function() {
        context("if the record is not present in the right operand", function() {
          it("triggers a remove event with the record", function() {
            var record = BlogPost.createFromRemote({id: 1, blogId: 1});
            var sortKey = union.buildSortKey(record);
            clearCallbackMocks();

            record.remotelyDestroyed();
            expect(removeCallback).to(haveBeenCalled, withArgs(record, 0, sortKey, sortKey));
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger a remove event", function() {
            var record = BlogPost.createFromRemote({id: 1, blogId: 1});
            user.favoritings().createFromRemote({blogPostId: 1})
            clearCallbackMocks();

            record.remotelyUpdated({blogId: 100});
            expect(removeCallback).toNot(haveBeenCalled);
          });
        });
      });

      describe("when a record is removed from the right operand", function() {
        context("if the record is not present in the left operand", function() {
          it("triggers remove callbacks with the record", function() {
            var record = BlogPost.createFromRemote({id: 1, blogId: 100});
            var sortKey = union.buildSortKey(record);
            var favoriting =  user.favoritings().createFromRemote({blogPostId: 1})
            clearCallbackMocks();

            favoriting.destroy();
            expect(removeCallback).to(haveBeenCalled, withArgs(record, 0, sortKey, sortKey));
          });
        });

        context("if the record is present in the left operand", function() {
          it("does not trigger a remove event", function() {
            var record = BlogPost.createFromRemote({id: 1, blogId: 1});
            var favoriting = user.favoritings().createFromRemote({blogPostId: 1})
            clearCallbackMocks();

            favoriting.remotelyDestroyed();
            expect(removeCallback).toNot(haveBeenCalled);
          });
        });
      });
    });
  });
}});
