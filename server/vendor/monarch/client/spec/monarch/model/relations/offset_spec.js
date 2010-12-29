//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Relations.Offset", function() {
    useExampleDomainModel();

    var offset, operand;

    before(function() {
      operand = BlogPost.orderBy('id asc');
      offset = operand.offset(2);
    });


    describe("#allTuples()", function() {
      it("returns all tuples from the #operand with an index beyond the #offset", function() {
        BlogPost.createFromRemote({id: 1});
        BlogPost.createFromRemote({id: 2});
        var post3 = BlogPost.createFromRemote({id: 3});
        var post4 = BlogPost.createFromRemote({id: 4});

        expect(offset.allTuples()).to(equal, [post3, post4]);
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

    describe("#hasSubscribers()", function() {
      it("returns true if a callback has been registered", function() {
        var subscription = offset.onRemoteInsert(function(){});
        expect(offset.hasSubscribers()).to(beTrue);
        subscription.destroy();
        expect(offset.hasSubscribers()).to(beFalse);

        subscription = offset.onRemoteUpdate(function(){});
        expect(offset.hasSubscribers()).to(beTrue);
        subscription.destroy();
        expect(offset.hasSubscribers()).to(beFalse);

        subscription = offset.onRemoteRemove(function(){});
        expect(offset.hasSubscribers()).to(beTrue);
        subscription.destroy();
        expect(offset.hasSubscribers()).to(beFalse);
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
        offset.onRemoteInsert(insertCallback);

        removeCallback = mockFunction("remove callback", function(record) {
          expect(offset.contains(record)).to(beFalse);
        });
        offset.onRemoteRemove(removeCallback);

        updateCallback = mockFunction("update callback");
        offset.onRemoteUpdate(updateCallback);
      });


      describe("when a record is inserted into operand remotely", function() {
        describe("when the record's index is less than n", function() {
          describe("when the operand has n or more records", function() {
            it("fires an insert event with the record whose index is now n", function() {
              BlogPost.createFromRemote({id: 0});
              expect(insertCallback).to(haveBeenCalled, withArgs(post2, 0));
            });
          });

          describe("when the operand has less than n records", function() {
            it("does not fire any event handlers, because no records have an index >= n", function() {
              post2.remotelyDestroyed();
              post3.remotelyDestroyed();
              post4.remotelyDestroyed();

              BlogPost.createFromRemote({id: 2});
              expect(insertCallback).toNot(haveBeenCalled);
            });
          });
        });

        describe("when the record's index is greater than n", function() {
          it("fires an insert event with the inserted record", function() {
            var record = BlogPost.createFromRemote({id: 5});
            expect(insertCallback).to(haveBeenCalled, withArgs(record, 2));
          });
        });
      });

      describe("when a record is updated in the operand remotely", function() {
        describe("when the updated record's index was < n before the update", function() {
          describe("when the updated record's index is >= n after the update", function() {
            it("fires an insert event for the updated record and a remove event for the record whose index was n and is now n - 1", function() {
              post1.remotelyUpdated({id: 3.5});
              expect(removeCallback).to(haveBeenCalled, withArgs(post3, 0));
              expect(insertCallback).to(haveBeenCalled, withArgs(post1, 0));
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
              expect(insertCallback).to(haveBeenCalled, withArgs(post2, 0));
              expect(removeCallback).to(haveBeenCalled, withArgs(post4, 1));
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

      describe("", function() {

      });
    });

    describe("subscription propagation", function() {

    });

    describe("#isEqual", function() {

    });
  });
}});
