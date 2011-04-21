//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Relations.Difference", function() {
    useExampleDomainModel();

    describe("#tuples()", function() {
      var difference, user3, user4;
      before(function() {
        User.createFromRemote({id: 1, age: 28});
        User.createFromRemote({id: 2, age: 28});
        user3 = User.createFromRemote({id: 3, age: 29});
        user4 = User.createFromRemote({id: 4, age: 30});
        difference = User.difference(User.where({age: 28}));
      });

      it("returns the tuples in the left operand which do not correspond to tuples with the same id in the right operand", function() {
        expect(difference.tuples()).to(equal, [user3, user4]);
      });
    });

    describe("event handling", function() {
      var leftOperand, rightOperand, difference, record, insertCallback, updateCallback, removeCallback;
      init(function() {
        // operands are selectively overridden below
        leftOperand = Blog.table;
        rightOperand = Blog.table;
      });

      before(function() {
        difference = new Monarch.Model.Relations.Difference(leftOperand, rightOperand);

        insertCallback = mockFunction("insertCallback");
        updateCallback = mockFunction("updateCallback");
        removeCallback = mockFunction("removeCallback");
        difference.onInsert(insertCallback);
        difference.onUpdate(updateCallback);
        difference.onRemove(removeCallback);
      });

      function expectNoCallbacksToHaveBeenCalled() {
        expect(insertCallback).toNot(haveBeenCalled);
        expect(updateCallback).toNot(haveBeenCalled);
        expect(removeCallback).toNot(haveBeenCalled);
      }

      describe("when a record is inserted in the left operand", function() {
        init(function() {
          rightOperand = Blog.where({userId: 1});
        });

        context("if the record is not present in the right operand", function() {
          it("triggers insert callbacks with the record", function() {
            var record = Blog.createFromRemote({id: 1, userId: 2});
            var sortKey = difference.buildSortKey(record);
            expect(insertCallback).to(haveBeenCalled, withArgs(record, 0, sortKey, sortKey));
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
            Blog.createFromRemote({id: 1, userId: 1});
            expectNoCallbacksToHaveBeenCalled();
          });
        });
      });

      describe("when a record is inserted in the right operand", function() {
        context("if the record is not present in the left operand", function() {
          init(function() {
            leftOperand = Blog.where({userId: 1});
          });

          it("does not trigger any callbacks", function() {
            rightOperand.createFromRemote({id: 1, userId: 2});
            expectNoCallbacksToHaveBeenCalled();
          });
        });

        context("if the record is present in the left operand", function() {
          init(function() {
            rightOperand = Blog.where({userId: 1});
          });

          it("triggers remove callbacks with the record", function() {
            var record = Blog.createFromRemote({id: 1, userId: 2})
            expect(leftOperand.contains(record)).to(beTrue);
            expect(rightOperand.contains(record)).to(beFalse);

            record.remotelyUpdated({userId: 1});
            expect(leftOperand.contains(record)).to(beTrue);
            expect(rightOperand.contains(record)).to(beTrue);

            var sortKey = difference.buildSortKey(record);

            expect(removeCallback).to(haveBeenCalled, withArgs(record, 0, sortKey, sortKey));
          });
        });
      });

      describe("when a record is updated in the left operand", function() {
        init(function() {
          rightOperand = Blog.where({userId: 1});
        });

        context("if the record is not present in the right operand", function() {
          it("triggers update callbacks with the record", function() {
            var record = Blog.createFromRemote({id: 1, userId: 2});
            expect(rightOperand.contains(record)).to(beFalse);


            record.remotelyUpdated({userId: 100});
            var sortKey = difference.buildSortKey(record);

            expect(updateCallback).to(haveBeenCalled, withArgs(
              record,
              {userId: {column: Blog.userId, oldValue: 2, newValue: 100 }},
              0, 0, sortKey, sortKey // new index, old index, new sort key, old sort key
            ));
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
            var record = Blog.createFromRemote({id: 1, userId: 1});
            record.update({name: "Tarot Route"});
            expectNoCallbacksToHaveBeenCalled();
          });
        });
      });

      describe("when a record is removed from the left operand", function() {
        context("if the record is not present in the right operand", function() {
          init(function() {
            rightOperand = Blog.where({userId: 1});
          });

          it("triggers remove callbacks with the record", function() {
            var record = Blog.createFromRemote({id: 1, userId: 2});
            var sortKey = difference.buildSortKey(record);
            record.destroy();
            expect(removeCallback).to(haveBeenCalled, withArgs(record, 0, sortKey, sortKey));
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
            var record = Blog.createFromRemote({id: 1, userId: 1});
            record.destroy();
            expectNoCallbacksToHaveBeenCalled();
          });
        });
      });

      describe("when a record is removed from the right operand", function() {
        context("if the record is not present in the left operand", function() {
          init(function() {
            leftOperand = Blog.where({userId: 1});
          });

          it("does not trigger any callbacks", function() {
            var record = Blog.createFromRemote({id: 1, userId: 2});
            record.destroy();
            expectNoCallbacksToHaveBeenCalled();
          });
        });

        context("if the record is present in the left operand", function() {
          init(function() {
            rightOperand = Blog.where({userId: 1});
          });

          it("triggers insert callbacks with the record", function() {
            var record = Blog.createFromRemote({id: 1, userId: 1});
            var sortKey = difference.buildSortKey(record);
            record.remotelyUpdated({userId: 2})
            expect(insertCallback).to(haveBeenCalled, withArgs(record, 0, sortKey, sortKey));
          });
        });
      });
    });
  });
}});
