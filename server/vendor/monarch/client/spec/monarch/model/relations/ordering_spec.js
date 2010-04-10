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
        ordering.onRemoteInsert(insertCallback);

        removeCallback = mockFunction("remove callback", function(record) {
          expect(ordering.contains(record)).to(beFalse);
        });
        ordering.onRemoteRemove(removeCallback);

        updateCallback = mockFunction("update callback");
        ordering.onRemoteUpdate(updateCallback);
      });

      describe("when a tuple is remotely updated in operand", function() {
        it("triggers #onRemoteUpdate callbacks with the updated tuple and its old and new index in the ordering", function() {
          var tuplesLengthBefore = ordering._tuples.length;
          user3.update({age: 0});
          expect(updateCallback).to(haveBeenCalled);

          var args = updateCallback.mostRecentArgs;
          expect(args[0]).to(eq, user3);
          expect(args[1].age.oldValue).to(eq, 2);
          expect(args[1].age.newValue).to(eq, 0);
          
          expect(args[2]).to(eq, 0); // new index
          expect(args[3]).to(eq, 2); // old index

          expect(ordering._tuples.length).to(eq, tuplesLengthBefore);
          expect(ordering._tuples[0]).to(eq, user3);

          updateCallback.clear();
          user3.update({signedUpAt: new Date()});
          expect(updateCallback).to(haveBeenCalled);
          expect(updateCallback.mostRecentArgs[2]).to(eq, 0);
          expect(updateCallback.mostRecentArgs[3]).to(eq, 0);
        });
      });
    });
  });
}});
