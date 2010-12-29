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
        describe("when the record's index is less than #n", function() {
          describe("when the operand has #n or more records", function() {
            it("fires an insert event with the record whose index is now #n", function() {
              BlogPost.createFromRemote({id: 0});
              expect(insertCallback).to(haveBeenCalled, withArgs(post2, 0));
            });
          });

          describe("when the operand has less than #n records", function() {
            it("does not fire any event handlers, because no records have an index >= #n", function() {
              post2.remotelyDestroyed();
              post3.remotelyDestroyed();
              post4.remotelyDestroyed();

              BlogPost.createFromRemote({id: 2});
              expect(insertCallback).toNot(haveBeenCalled);
            });
          });
        });

        describe("when the record's index is greater than #n", function() {
          it("fires an insert event with the inserted record", function() {
            var record = BlogPost.createFromRemote({id: 5});
            expect(insertCallback).to(haveBeenCalled, withArgs(record, 2));
          });
        });
      });

      describe("when a record is updated in the operand remotely", function() {
        
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
