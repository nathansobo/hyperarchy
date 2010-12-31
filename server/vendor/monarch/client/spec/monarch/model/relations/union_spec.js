//= require "../../../monarch_spec_helper"

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
      var user, union, insertCallback, updateCallback, removeCallback;
      useLocalFixtures();

      before(function() {
        user = User.find("jan");
        var leftOperand = user.blogPosts();
        var rightOperand = user.favoriteBlogPosts();
        union = new Monarch.Model.Relations.Union(leftOperand, rightOperand);

        insertCallback = mockFunction("insertCallback");
        updateCallback = mockFunction("updateCallback");
        removeCallback = mockFunction("removeCallback");
        union.onRemoteInsert(insertCallback);
        union.onRemoteUpdate(updateCallback);
        union.onRemoteRemove(removeCallback);
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
          it("triggers insert callbacks with the record", function() {
            var post = BlogPost.find("frying");
            post.remotelyUpdated({blogId: "motorcycle"})

            expect(insertCallback).to(haveBeenCalled, withArgs(post));
            expect(updateCallback).toNot(haveBeenCalled);
            expect(removeCallback).toNot(haveBeenCalled);
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger an insert callbacks", function() {
            var post = BlogPost.find("frying");
            user.favoritings().createFromRemote({blogPostId: post.id()});
            clearCallbackMocks();

            post.remotelyUpdated({blogId: "motorcycle"})
            expect(insertCallback).toNot(haveBeenCalled);
            // update callback gets called as an artifact of how we insert into the left operand
            expect(updateCallback).to(haveBeenCalled, once);
            expect(removeCallback).toNot(haveBeenCalled);
          });
        });
      });

      describe("when a record is inserted in the right operand", function() {
        context("if the record is not present in the left operand", function() {
          it("triggers insert callbacks with the record", function() {
            var post = BlogPost.find("frying");
            user.favoritings().createFromRemote({blogPostId: post.id()});
            expect(insertCallback).to(haveBeenCalled, withArgs(post));
            expect(updateCallback).toNot(haveBeenCalled);
            expect(removeCallback).toNot(haveBeenCalled);
          });
        });

        context("if the record is present in the left operand", function() {
          it("does not trigger any callbacks", function() {
            user.favoritings().createFromRemote({blogPostId: "helmet"});
            expectNoCallbacksToHaveBeenCalled();
          });
        });
      });

      describe("when a record is updated in the left operand", function() {
        context("if the record is not present in the right operand", function() {
          it("triggers update callbacks with the record", function() {
            var post = user.blogPosts().first();
            post.remotelyUpdated({name: "New Name"});
            expect(updateCallback).to(haveBeenCalled, once);
            expect(updateCallback.mostRecentArgs[0]).to(eq, post);
            expect(insertCallback).toNot(haveBeenCalled);
            expect(removeCallback).toNot(haveBeenCalled);
          });
        });

        context("if the record is present in the right operand", function() {
          it("triggers update callbacks with the record, but not twice", function() {
            var post = user.blogPosts().first();
            user.favoritings().createFromRemote({blogPostId: post.id()})
            clearCallbackMocks();

            post.update({name: "New Name"});
            expect(updateCallback).to(haveBeenCalled, once);
          });
        });
      });

      describe("when a record is removed from the left operand", function() {
        context("if the record is not present in the right operand", function() {
          it("triggers remove callbacks with the record", function() {
            var post = user.blogPosts().first();
            post.remotelyDestroyed();
            expect(removeCallback).to(haveBeenCalled, once);
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
            var post = user.blogPosts().first();
            user.favoritings().createFromRemote({blogPostId: post.id()});
            post.remotelyUpdated({blogId: "recipes"});
            expect(removeCallback).toNot(haveBeenCalled);
          });
        });
      });

      describe("when a record is removed from the right operand", function() {
        context("if the record is not present in the left operand", function() {
          it("triggers remove callbacks with the record", function() {
            var post = BlogPost.find("frying");
            var favoriting = user.favoritings().createFromRemote({blogPostId: post.id()});
            favoriting.destroy();
            expect(removeCallback).to(haveBeenCalled, withArgs(post));
          });
        });

        context("it does not trigger any callbacks", function() {
          it("triggers insert callbacks with the record", function() {
            var post = user.blogPosts().first();
            var favoriting = user.favoritings().createFromRemote({blogPostId: post.id()});
            clearCallbackMocks();
            favoriting.destroy();
            expect(removeCallback).toNot(haveBeenCalled);
          });
        });
      });
    });
  });
}});
