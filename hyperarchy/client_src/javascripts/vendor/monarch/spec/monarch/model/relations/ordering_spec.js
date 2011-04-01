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
      // should go  1:(1 A), 2:(2 B), 3:(2 C), 4:(3 D)

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

      describe("when a tuple is inserted into the operand", function() {
        it("triggers #onInsert callbacks with the inserted tuple and its index", function() {
          var record = User.createFromRemote({id: 5, age: 2, fullName: "D"});
          var sortKey = ordering.buildSortKey(record);

          expect(insertCallback).to(haveBeenCalled, withArgs(record, 3, sortKey, sortKey));
          expect(ordering.at(3)).to(eq, record);
        });
      });

      describe("when a tuple is updated in the operand", function() {
        it("triggers update events with the updated tuple and its new and old index", function() {
          var sizeBefore = ordering.size();

          user3.update({age: 20000});

          expect(updateCallback).to(haveBeenCalled, withArgs(
            user3, // record
            { age: { column: User.age, oldValue: 2, newValue: 20000 } }, // changeset
            3, 2, // new index, old index
            { 'users.id': 3, 'users.age': 20000, 'users.full_name': "C" }, // new sort key
            { 'users.id': 3, 'users.age': 2, 'users.full_name': "C" } // old sort key
          ));
          expect(ordering.at(3)).to(eq, user3);

          updateCallback.clear();
          user3.update({age: 0});

          expect(updateCallback).to(haveBeenCalled, withArgs(
            user3, // record
            { age: { column: User.age, oldValue: 20000, newValue: 0 } }, // changeset
            0, 3, // new index, old index
            { 'users.id': 3, 'users.age': 0, 'users.full_name': "C" }, // new sort key
            { 'users.id': 3, 'users.age': 20000, 'users.full_name': "C" } // old sort key
          ));

          expect(ordering.size()).to(eq, sizeBefore);
          expect(ordering.at(0)).to(eq, user3);

          updateCallback.clear();


          var oldDate = user3.signedUpAt();
          var newDate = new Date();
          var sortKey = ordering.buildSortKey(user3);

          user3.update({signedUpAt: new Date()});

          expect(updateCallback).to(haveBeenCalled, withArgs(
            user3, // record
            { signedUpAt: { column: User.signedUpAt, oldValue: oldDate, newValue: newDate } }, // changeset
            0, 0, sortKey, sortKey // new index, old index, new sort key, old sort key
          ));
        });
      });

      describe("when a tuple is removed from the operand", function() {
        it("triggers #onRemove callbacks with the removed tuple and its former index", function() {
          var sortKey = ordering.buildSortKey(user2);
          user2.remotelyDestroyed();
          expect(removeCallback).to(haveBeenCalled, withArgs(user2, 1, sortKey, sortKey));
        });
      });
    });
  });
}});
