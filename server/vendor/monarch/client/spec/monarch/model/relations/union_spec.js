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


    describe("#allTuples", function() {
      it("returns the union tuples in the left operand and right operand", function() {
        var user1 = User.localCreate({age: 22, fullName: "Mackrel"});
        var user2 = User.localCreate({age: 32, fullName: "Jonie"});
        var user3 = User.localCreate({age: 32, fullName: "John"});
        var user4 = User.localCreate({fullName: "John"});
        var user5 = User.localCreate({fullName: "Mark"});

        Server.save(User.table);

        var tuples = union.allTuples();
        expect(tuples.length).to(equal, 3);
        expect(_.include(tuples, user2)).to(beTrue);
        expect(_.include(tuples, user3)).to(beTrue);
        expect(_.include(tuples, user4)).to(beTrue);
      });
    });

    describe("event handling", function() {
      var table1, table2, difference, record, insertCallback, updateCallback, removeCallback;
      init(function() {
        leftOperand = Blog.table;
        rightOperand = Blog.table;
      });

      before(function() {
        difference = new Monarch.Model.Relations.Difference(leftOperand, rightOperand);

        insertCallback = mockFunction("insertCallback");
        updateCallback = mockFunction("updateCallback");
        removeCallback = mockFunction("removeCallback");
        difference.onRemoteInsert(insertCallback);
        difference.onRemoteUpdate(updateCallback);
        difference.onRemoteRemove(removeCallback);
      });

      function expectNoCallbacksToHaveBeenCalled() {
        expect(insertCallback).toNot(haveBeenCalled);
        expect(updateCallback).toNot(haveBeenCalled);
        expect(removeCallback).toNot(haveBeenCalled);
      }

      describe("when a record is inserted in the left operand", function() {
        context("if the record is not present in the right operand", function() {
          it("triggers insert callbacks with the record", function() {
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
          });
        });
      });

      describe("when a record is inserted in the right operand", function() {
        context("if the record is not present in the left operand", function() {
          it("does not trigger any callbacks", function() {
          });
        });

        context("if the record is present in the left operand", function() {
          it("triggers remove callbacks with the record", function() {
          });
        });
      });

      describe("when a record is updated in the left operand", function() {
        context("if the record is not present in the right operand", function() {
          it("triggers update callbacks with the record", function() {
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
          });
        });
      });

      describe("when a record is removed from the left operand", function() {
        context("if the record is not present in the right operand", function() {
          it("triggers remove callbacks with the record", function() {
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
          });
        });
      });

      describe("when a record is removed from the right operand", function() {
        context("if the record is not present in the left operand", function() {
          it("does not trigger any callbacks", function() {
          });
        });

        context("if the record is present in the left operand", function() {
          it("triggers insert callbacks with the record", function() {
          });
        });
      });
    });
  });
}});
