//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Relations.Offset", function() {
    useExampleDomainModel();

    var offset, operand;

    before(function() {
      operand = BlogPost.orderBy('id asc');
      offset = operand.offset(2);
    });


    describe("#tuples()", function() {
      it("returns all tuples from the operand that have an index beyond n", function() {
        BlogPost.createFromRemote({id: 1});
        BlogPost.createFromRemote({id: 2});
        var post3 = BlogPost.createFromRemote({id: 3});
        var post4 = BlogPost.createFromRemote({id: 4});

        expect(offset.tuples()).to(equal, [post3, post4]);
      });
    });

    describe("#wireRepresentation()", function() {
      it("returns the JSON representation of the Selection", function() {
        expect(offset.wireRepresentation()).to(equal, {
          type: "offset",
          operand: operand.wireRepresentation(),
          n: 2
        });
      });
    });

    describe("#isEqual", function() {
      it("returns true for only for semantically equivalent relations", function() {
        expect(offset.isEqual(operand.offset(2))).to(beTrue);
        expect(offset.isEqual(operand.offset(3))).to(beFalse);
        expect(offset.isEqual(operand)).to(beFalse);
        expect(offset.isEqual(1)).to(beFalse);
        expect(offset.isEqual(null)).to(beFalse);
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
          expect(offset.contains(record)).to(beTrue);
        });
        offset.onInsert(insertCallback);

        removeCallback = mockFunction("remove callback", function(record) {
          expect(offset.contains(record)).to(beFalse);
        });
        offset.onRemove(removeCallback);

        updateCallback = mockFunction("update callback");
        offset.onUpdate(updateCallback);
      });

      function clearCallbackMocks() {
        insertCallback.clear();
        updateCallback.clear();
        removeCallback.clear();
      }


      describe("when a record is inserted into operand remotely", function() {
        describe("when the inserted record's index is less than n", function() {
          describe("when the operand has n or more records", function() {
            it("fires an insert event with the record whose index is now n", function() {
              BlogPost.createFromRemote({id: 0});

              var sortKey = BlogPost.table.buildSortKey(post2);
              expect(insertCallback).to(haveBeenCalled, withArgs(post2, 0, sortKey, sortKey));
            });
          });

          describe("when the operand has less than n records", function() {
            it("does not fire any event handlers, because no records have an index >= n", function() {
              post2.remotelyDestroyed();
              post3.remotelyDestroyed();
              post4.remotelyDestroyed();

              clearCallbackMocks();

              BlogPost.createFromRemote({id: 2});
              expect(insertCallback).toNot(haveBeenCalled);
            });
          });
        });

        describe("when the inserted record's index is greater than n", function() {
          it("fires an insert event with the inserted record", function() {
            var record = BlogPost.createFromRemote({id: 5});
            var sortKey = BlogPost.table.buildSortKey(record);
            expect(insertCallback).to(haveBeenCalled, withArgs(record, 2, sortKey, sortKey));
          });
        });
      });

      describe("when a record is updated in the operand remotely", function() {
        describe("when the updated record's index was < n before the update", function() {
          describe("when the updated record's index is >= n after the update", function() {
            it("fires an insert event for the updated record and a remove event for the record whose index was n and is now n - 1", function() {
              post1.remotelyUpdated({id: 3.5});
              expect(removeCallback).to(haveBeenCalled, withArgs(post3, 0, {'blog_posts.id': 3}, {'blog_posts.id': 3}));
              expect(insertCallback).to(haveBeenCalled, withArgs(post1, 0, {'blog_posts.id': 3.5}, {'blog_posts.id': 1}));
            });
          });
          
          describe("when the updated record's index remains < n after the update", function() {
            it("fires no events", function() {
              post1.remotelyUpdated({id: 2.5});
              expect(removeCallback).toNot(haveBeenCalled);
              expect(updateCallback).toNot(haveBeenCalled);
              expect(insertCallback).toNot(haveBeenCalled);
            });
          });
        });
        
        describe("when the record's index was >= n before the update", function() {
          describe("when the record's index is < n after the update", function() {
            it("fires a remove event for the updated record and an insert event for the record whose index was n - 1 and is now n", function() {
              post4.remotelyUpdated({id: 1.5});
              expect(removeCallback).to(haveBeenCalled, withArgs(post4, 1, {'blog_posts.id': 1.5}, {'blog_posts.id': 4}));
              expect(insertCallback).to(haveBeenCalled, withArgs(post2, 0, {'blog_posts.id': 2}, {'blog_posts.id': 2}));
            });
          });
          
          describe("when the record's index remains >= n after the update", function() {
            it("fires an update event for the updated record", function() {
              post3.remotelyUpdated({id: 5});
              expect(updateCallback).to(haveBeenCalled, 1);
              expect(updateCallback.mostRecentArgs[0]).to(eq, post3);
              expect(updateCallback.mostRecentArgs[1].id).toNot(beNull);
              expect(updateCallback.mostRecentArgs[2]).to(eq, 1);
              expect(updateCallback.mostRecentArgs[3]).to(eq, 0);
            });
          });
        });
      });

      describe("when a record is removed from the operand", function() {
        describe("when the removed record's index is < n", function() {
          describe("when there are more than n records in the operand", function() {
            it("fires a remove event for the former first record in the offset that now has an index of n - 1", function() {
              post2.remotelyDestroyed();
              var sortKey = offset.buildSortKey(post3);
              expect(removeCallback).to(haveBeenCalled, withArgs(post3, 0, sortKey, sortKey));
            });
          });

          describe("when there are <= n records in the operand", function() {
            it("doesn't fire any event handlers", function() {
              post3.remotelyDestroyed();
              post4.remotelyDestroyed();

              clearCallbackMocks();

              post1.remotelyDestroyed();
              expect(removeCallback).toNot(haveBeenCalled);
            });
          });

        });

        describe("when the removed record's index is >= n", function() {
          it("fires a remove event for the removed record", function() {
            var sortKey = offset.buildSortKey(post4);
            post4.remotelyDestroyed();
            expect(removeCallback).to(haveBeenCalled, withArgs(post4, 1, sortKey, sortKey));
          });
        });
      });
    });
  });
}});
