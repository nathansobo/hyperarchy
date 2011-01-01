//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Relations.Ordering", function() {
    var ordering, operand, sortSpecifications, user1, user2, user3, user4;

    useExampleDomainModel();

    init(function() {
      sortSpecifications = [User.age.asc(), User.fullName.asc()];
    });

    before(function() {
      operand = User.table;
      ordering = new Monarch.Model.Relations.Ordering(operand, sortSpecifications);

      // created in a strange order to ensure that has no effect on sort
      user4 = User.createFromRemote({id: 4, age: 3, fullName: "D"});
      user1 = User.createFromRemote({id: 1, age: 1, fullName: "A"});
      user3 = User.createFromRemote({id: 3, age: 2, fullName: "C"});
      user2 = User.createFromRemote({id: 2, age: 2, fullName: "B"});
    });

    describe("#tuples", function() {
      context("when both of the ordering columns are ascending", function() {
        it("returns the tuples of its #operand in the correct order", function() {
          expect(ordering.tuples()).to(equal, [user1, user2, user3, user4]);
        });
      });

      context("when one of the ordering columns is descending", function() {
        init(function() {
          sortSpecifications = [User.age.desc(), User.fullName.asc()];
        });

        it("returns the tuples of its #operand in the correct order", function() {
          expect(ordering.tuples()).to(equal, [user4, user2, user3, user1]);
        });
      });
    });

    describe("event handling", function() {
      useFakeServer();

      var insertCallback, removeCallback, updateCallback;
      before(function() {
        insertCallback = mockFunction("insert callback", function(record) {
          expect(ordering.contains(record)).to(beTrue);
        });
        ordering.onInsert(insertCallback);

        removeCallback = mockFunction("remove callback", function(record) {
          expect(ordering.contains(record)).to(beFalse);
        });
        ordering.onRemove(removeCallback);

        updateCallback = mockFunction("update callback");
        ordering.onUpdate(updateCallback);
      });

      describe("when a tuple is remotely inserted into the operand", function() {
        it("triggers #onInsert callbacks with the inserted tuple and its index", function() {
          var record = User.createFromRemote({id: 5, age: 2, fullName: "D"});
          expect(insertCallback).to(haveBeenCalled, withArgs(record, 3));
          expect(ordering._tuples.at(3)).to(eq, record);
        });
      });

      describe("when a tuple is remotely updated in the operand", function() {
        it("triggers #onUpdate callbacks with the updated tuple and its new and old index in the ordering", function() {
          var tuplesLengthBefore = ordering._tuples.length;

          user3.update({age: 20000});
          expect(updateCallback).to(haveBeenCalled);
          var args = updateCallback.mostRecentArgs;
          expect(args[0]).to(eq, user3);
          expect(args[2]).to(eq, 3); // new index
          expect(args[3]).to(eq, 2); // old index

          updateCallback.clear();
          user3.update({age: 0});
          expect(updateCallback).to(haveBeenCalled);

          var args = updateCallback.mostRecentArgs;
          expect(args[0]).to(eq, user3);
          expect(args[2]).to(eq, 0); // new index
          expect(args[3]).to(eq, 3); // old index

          expect(ordering._tuples.length).to(eq, tuplesLengthBefore);
          expect(ordering._tuples[0]).to(eq, user3);

          updateCallback.clear();
          user3.update({signedUpAt: new Date()});
          expect(updateCallback).to(haveBeenCalled);
          expect(updateCallback.mostRecentArgs[2]).to(eq, 0);
          expect(updateCallback.mostRecentArgs[3]).to(eq, 0);
        });
      });

      describe("when a tuple is removed from the operand", function() {
        it("triggers #onRemove callbacks with the removed tuple and its former index", function() {
          user2.remotelyDestroyed();
          expect(removeCallback).to(haveBeenCalled, withArgs(user2, 1));
        });
      });
    });
  });
}});
