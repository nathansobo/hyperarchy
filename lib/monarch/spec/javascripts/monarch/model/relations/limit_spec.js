//= require monarch_spec_helper

Screw.Unit(function(c) { with(c) {
  describe("Relations.Offset", function() {
    useExampleDomainModel();

    var limit, operand;

    before(function() {
      operand = BlogPost.table;
      limit = operand.limit(2);
    });


    describe("#tuples()", function() {
      it("returns all tuples from the operand that have an index < n", function() {
        var post1 = BlogPost.createFromRemote({id: 1});
        var post2 = BlogPost.createFromRemote({id: 2});
        BlogPost.createFromRemote({id: 3});
        BlogPost.createFromRemote({id: 4});

        expect(limit.tuples()).to(equal, [post1, post2]);
      });
    });

    describe("#wireRepresentation()", function() {
      it("returns the JSON representation of the limit", function() {
        expect(limit.wireRepresentation()).to(equal, {
          type: "limit",
          operand: operand.wireRepresentation(),
          count: 2
        });
      });
    });

    describe("#isEqual", function() {
      it("returns true for only for semantically equivalent relations", function() {
        expect(limit.isEqual(operand.limit(2))).to(beTrue);
        expect(limit.isEqual(operand.limit(3))).to(beFalse);
        expect(limit.isEqual(operand)).to(beFalse);
        expect(limit.isEqual(1)).to(beFalse);
        expect(limit.isEqual(null)).to(beFalse);
      });
    });

    describe("event handling", function() {
      var insertCallback, removeCallback, updateCallback, post1, post2, post3, post4;
      before(function() {
        post1 = BlogPost.createFromRemote({id: 1});
        post2 = BlogPost.createFromRemote({id: 2});
        post3 = BlogPost.createFromRemote({id: 3});
        post4 = BlogPost.createFromRemote({id: 4});

        insertCallback = mockFunction("insert callback", function(record) {
          expect(limit.contains(record)).to(beTrue);
        });
        limit.onInsert(insertCallback);

        removeCallback = mockFunction("remove callback", function(record) {
          expect(limit.contains(record)).to(beFalse);
        });
        limit.onRemove(removeCallback);

        updateCallback = mockFunction("update callback");
        limit.onUpdate(updateCallback);
      });

      function clearCallbackMocks() {
        insertCallback.clear();
        updateCallback.clear();
        removeCallback.clear();
      }

      describe("when a record is inserted into operand remotely", function() {
        describe("when the inserted record's index is < n", function() {
          describe("when the operand has n or more records", function() {
            it("triggers an insert event with the inserted record and a remove event with the record whose index is now n", function() {
              var newPost = BlogPost.createFromRemote({id: 0});

              var newSortKey = BlogPost.table.buildSortKey(newPost);
              var oldSortKey = BlogPost.table.buildSortKey(post2);
              expect(insertCallback).to(haveBeenCalled, withArgs(newPost, 0, newSortKey, newSortKey));
              expect(removeCallback).to(haveBeenCalled, withArgs(post2, 1, oldSortKey, oldSortKey));
            });
          });

          describe("when the operand has less than n records", function() {
            it("triggers an insert event with the inserted record", function() {
              post2.remotelyDestroyed();
              post3.remotelyDestroyed();
              post4.remotelyDestroyed();

              clearCallbackMocks();

              var newPost = BlogPost.createFromRemote({id: 2});
              var sortKey = BlogPost.table.buildSortKey(newPost);
              expect(insertCallback).to(haveBeenCalled, withArgs(newPost, 1, sortKey, sortKey));
            });
          });
        });

        describe("when the inserted record's index is greater than n", function() {
          it("does not trigger an insert event", function() {
            var newPost = BlogPost.createFromRemote({id: 100});
            expect(insertCallback).toNot(haveBeenCalled);
          });
        });
      });

      describe("when a record is updated in the operand", function() {
        describe("when the updated record's index was < n before the update", function() {
          describe("when the updated record's index is >= n after the update", function() {
            it("triggers a remove event for the updated record and an insert event for the record in the operand whose index was n and is now n - 1", function() {
              post1.remotelyUpdated({id: 3.5});
              expect(removeCallback).to(haveBeenCalled, withArgs(post1, 0, {'blog_posts.id': 3.5}, {'blog_posts.id': 1}));
              expect(insertCallback).to(haveBeenCalled, withArgs(post3, 1, {'blog_posts.id': 3}, {'blog_posts.id': 3}));
            });
          });
          
          describe("when the updated record's index remains < n after the update", function() {
            it("triggers an update event with the updated record", function() {
              post1.remotelyUpdated({id: 2.5});

              expect(updateCallback).to(haveBeenCalled, 1);
              expect(updateCallback.mostRecentArgs[0]).to(eq, post1);
              expect(updateCallback.mostRecentArgs[1].id).toNot(beNull);
              expect(updateCallback.mostRecentArgs[2]).to(eq, 1);
              expect(updateCallback.mostRecentArgs[3]).to(eq, 0);

              expect(removeCallback).toNot(haveBeenCalled);
              expect(insertCallback).toNot(haveBeenCalled);
            });
          });
        });
        
        describe("when the record's index was >= n before the update", function() {
          describe("when the record's index is < n after the update", function() {
            it("triggers an insert event with the updated record", function() {
              post4.remotelyUpdated({id: 1.5});
              expect(removeCallback).to(haveBeenCalled, withArgs(post2, 1, {'blog_posts.id': 2}, {'blog_posts.id': 2}));
              expect(insertCallback).to(haveBeenCalled, withArgs(post4, 1, {'blog_posts.id': 1.5}, {'blog_posts.id': 4}));
            });
          });
          
          describe("when the record's index remains >= n after the update", function() {
            it("does not trigger any events", function() {
              post3.remotelyUpdated({id: 5});

              expect(updateCallback).toNot(haveBeenCalled);
              expect(removeCallback).toNot(haveBeenCalled);
              expect(insertCallback).toNot(haveBeenCalled);
            });
          });
        });
      });

      describe("when a record is removed from the operand", function() {
        describe("when the removed record's index is < n", function() {
          describe("when there are more than n records in the operand", function() {
            it("triggers a remove event with the removed record and an insert event for the record formerly at index n in the operand that now has index n - 1", function() {
              post2.remotelyDestroyed();
              var sortKey2 = limit.buildSortKey(post2);
              var sortKey3 = limit.buildSortKey(post3);

              expect(removeCallback).to(haveBeenCalled, withArgs(post2, 1, sortKey2, sortKey2));
              expect(insertCallback).to(  haveBeenCalled, withArgs(post3, 1, sortKey3, sortKey3));
            });
          });

          describe("when there are <= n records in the operand", function() {
            it("triggers a remove event for the removed record but no insert events", function() {
              post3.remotelyDestroyed();
              post4.remotelyDestroyed();

              clearCallbackMocks();

              post1.remotelyDestroyed();
              var sortKey = BlogPost.table.buildSortKey(post1)

              expect(removeCallback).to(haveBeenCalled, withArgs(post1, 0, sortKey, sortKey));
              expect(insertCallback).toNot(haveBeenCalled);
            });
          });

        });

        describe("when the removed record's index is >= n", function() {
          it("does not trigger any events", function() {
            var sortKey = limit.buildSortKey(post4);
            post4.remotelyDestroyed();
            expect(removeCallback).toNot(haveBeenCalled);
          });
        });
      });
    });
  });
}});
