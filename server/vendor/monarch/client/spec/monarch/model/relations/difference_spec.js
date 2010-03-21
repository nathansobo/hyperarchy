//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Relations.Difference", function() {
    useLocalFixtures();

    describe("#tuples", function() {
      var leftOperand, rightOperand, difference;
      before(function() {
        leftOperand = User.table;
        rightOperand = User.where(User.age.eq(28));
        expect(leftOperand.tuples()).toNot(beEmpty);
        expect(rightOperand.tuples()).toNot(beEmpty);

        difference = new Monarch.Model.Relations.Difference(leftOperand, rightOperand);
      });

      it("returns the tuples in the left operand which do not correspond to tuples with the same id in the right operand", function() {
        var differenceTuples = difference.tuples();

        expect(differenceTuples).toNot(beEmpty);
        expect(differenceTuples.length).to(eq, leftOperand.size() - rightOperand.size());

        _.each(differenceTuples, function(record) {
          expect(rightOperand.find(record.id())).to(beNull);
        });
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
          init(function() {
            rightOperand = Blog.where({userId: "jim"});
          });

          it("triggers insert callbacks with the record", function() {
            leftOperand.create({userId: "johan"})
              .afterEvents(function(record) {
                expect(insertCallback).to(haveBeenCalled, withArgs(record));
              });
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
            leftOperand.create({});
            expectNoCallbacksToHaveBeenCalled();
          });
        });
      });

      describe("when a record is inserted in the right operand", function() {
        context("if the record is not present in the left operand", function() {
          init(function() {
            leftOperand = Blog.where({userId: "jim"});
          });

          it("does not trigger any callbacks", function() {
            rightOperand.create({userId: "johan"});
            expectNoCallbacksToHaveBeenCalled();
          });
        });

        context("if the record is present in the left operand", function() {
          init(function() {
            rightOperand = Blog.where({userId: "jim"});
          });

          it("triggers remove callbacks with the record", function() {
            leftOperand.create({userId: "willy"})
              .afterEvents(function(record) {
                record.update({userId: "jim"})
                  .afterEvents(function() {
                    expect(removeCallback).to(haveBeenCalled, withArgs(record));
                  });
              });
          });
        });
      });

      describe("when a record is updated in the left operand", function() {
        context("if the record is not present in the right operand", function() {
          init(function() {
            rightOperand = Blog.where({userId: 'jim'});
          });

          it("triggers update callbacks with the record", function() {
            var record = leftOperand.find('recipes');
            var userIdBeforeUpdate = record.userId();
            record.update({userId: "bingcrosby"});
            expect(updateCallback).to(haveBeenCalled, once);
            expect(updateCallback).to(haveBeenCalled, withArgs(record, {userId: {column: Blog.userId, oldValue: userIdBeforeUpdate, newValue: "bingcrosby" }}));
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
            var record = Blog.fixture('recipes');
            record.update({userId: "mojo"});
            expectNoCallbacksToHaveBeenCalled();
          });
        });
      });

      describe("when a record is removed from the left operand", function() {
        context("if the record is not present in the right operand", function() {
          init(function() {
            rightOperand = Blog.where({userId: 'jim'});
          });

          it("triggers remove callbacks with the record", function() {
            var record = Blog.fixture('recipes');
            record.destroy();
            expect(removeCallback).to(haveBeenCalled, withArgs(record));
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
            var record = Blog.fixture('recipes');
            record.destroy();
            expectNoCallbacksToHaveBeenCalled();
          });
        });
      });

      describe("when a record is removed from the right operand", function() {
        context("if the record is not present in the left operand", function() {
          init(function() {
            leftOperand = Blog.where({userId: 'jim'});
          });

          it("does not trigger any callbacks", function() {
            var record = Blog.fixture('recipes');
            record.destroy();
            expectNoCallbacksToHaveBeenCalled();
          });
        });

        context("if the record is present in the left operand", function() {
          init(function() {
            rightOperand = Blog.where({userId: 'jan'});
          });

          it("triggers insert callbacks with the record", function() {
            var record = Blog.fixture({userId: 'jan'});
            record.update({userId: 'jonah'})
            expect(insertCallback).to(haveBeenCalled, withArgs(record));
          });
        });
      });
    });

    describe("when the difference is between two distinct but compatible relations", function() {
      var difference, leftOperand, rightOperand, insertCallback, updateCallback, removeCallback;

      before(function() {
        _.constructor('A', Monarch.Model.Record);
        _.constructor('B', Monarch.Model.Record);
        A.columns({ projectedId: "string", baz: "string" });
        B.columns({ projectedId: "string", baz: "string" });

        leftOperand = A.project(A.projectedId.as('id'), A.baz);
        rightOperand = B.project(B.projectedId.as('id'), B.baz);

        difference = new Monarch.Model.Relations.Difference(leftOperand, rightOperand);

        insertCallback = mockFunction('insertCallback');
        updateCallback = mockFunction('updateCallback');
        removeCallback = mockFunction('removeCallback');

        difference.onRemoteInsert(insertCallback);
        difference.onRemoteUpdate(updateCallback);
        difference.onRemoteRemove(removeCallback);
      });

      after(function() {
        delete window.A;
        delete window.B;
        delete Repository.tables.as;
        delete Repository.tables.bs;
      });

      it("only considers the 'id' property when performing the difference", function() {
        A.create({projectedId: "foo", baz: "quux"});
        expect(insertCallback).to(haveBeenCalled, once);

        A.find({projectedId: 'foo'}).update({baz: "morning"});
        expect(updateCallback).to(haveBeenCalled, once);

        B.create({projectedId: "foo"});
        expect(removeCallback).to(haveBeenCalled, once);

        updateCallback.clear();
        var aRecord = A.find({projectedId: 'foo'});
        aRecord.update({baz: "evening"});
        expect(updateCallback).toNot(haveBeenCalled);

        removeCallback.clear();
        aRecord.destroy();
        expect(removeCallback).toNot(haveBeenCalled);

        insertCallback.clear();
        A.create({projectedId: "foo", baz: "quux"});
        expect(insertCallback).toNot(haveBeenCalled);
        
        B.find({projectedId: 'foo'}).destroy();
        expect(insertCallback).to(haveBeenCalled, once);
      });
    });
  });
}});
