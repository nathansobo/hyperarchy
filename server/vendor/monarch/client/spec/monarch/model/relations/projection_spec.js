//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Relations.Projection", function() {
    useLocalFixtures();
    
    var operand, projectedColumns, projection;
    before(function() {
      operand = Blog.table;
      projectedColumns = [new Monarch.Model.ProjectedColumn(Blog.userId), Blog.name_.as('blogName')];
      projection = new Monarch.Model.Relations.Projection(operand, projectedColumns);
    });


    describe("#tuples", function() {
      it("returns ProjectedTuples with fields corresponding only to the #projectedColumns", function() {
        var projectionTuples = projection.tuples();
        var operandTuples = operand.tuples();

        expect(projectionTuples).toNot(beEmpty);
        expect(projectionTuples.length).to(eq, operandTuples.length);

        _.each(operand.tuples(), function(operandRecord, index) {
          var projectionRecord = projectionTuples[index];
          expect(projectionRecord.userId()).to(eq, operandRecord.userId());
          expect(projectionRecord.field(projection.column('blogName')).value()).to(eq, operandRecord.name());
          expect(projectionRecord.field('blogName').value()).to(eq, operandRecord.name());
          expect(projectionRecord.startedAt).to(beNull);
        });
      });
    });


    describe("event handling", function() {
      var insertCallback, updateCallback, removeCallback;
      before(function() {
        insertCallback = mockFunction("insertCallback");
        updateCallback = mockFunction("updateCallback");
        removeCallback = mockFunction("removeCallback");
        projection.onRemoteInsert(insertCallback);
        projection.onRemoteUpdate(updateCallback);
        projection.onRemoteRemove(removeCallback);
      });

      describe("when a record is inserted into the operand", function() {
        it("triggers onRemoteInsert callbacks with the inserted record's corresponding ProjectionRecord", function() {
          var operandRecord = operand.create({name: "Radio Flyer"});

          expect(insertCallback).to(haveBeenCalled, once);
          expect(insertCallback.mostRecentArgs[0].blogName()).to(eq, "Radio Flyer");
          expect(projection.find(projection.column('blogName').eq("Radio Flyer"))).to(eq, insertCallback.mostRecentArgs[0]);
        });
      });

      describe("when a record is updated in the operand", function() {
        context("if any of the updated columns are in #projectedColumns", function() {
          it("triggers onRemoteUpdate callbacks with the record's corresponding ProjectionRecord and the changed columns", function() {
            var operandRecord = operand.find('motorcycle');
            var oldName = operandRecord.name();
            var projectionRecord = projection.find(projection.column('blogName').eq(operandRecord.name()));
            expect(projectionRecord).toNot(beNull);
            
            operandRecord.update({name: "Motorcycles: Wheee!"});

            expect(updateCallback).to(haveBeenCalled, withArgs(projectionRecord, {
              blogName: {
                column: projection.column('blogName'),
                oldValue: oldName,
                newValue: "Motorcycles: Wheee!"
              }
            }));
          });
        });

        context("if none of the updated columns are in #projectedColumns", function() {
          it("does not trigger any callbacks", function() {
            var operandRecord = operand.find('motorcycle');

            operandRecord.localUpdate({startedAt: new Date()});

            expect(updateCallback).toNot(haveBeenCalled, once);
          });
        });
      });

      describe("when a record is removed from the operand", function() {
        it("triggers onRemoteRemove callbacks with the removed record's corresponding ProjectionRecord", function() {
          var operandRecord = operand.find('motorcycle');
          var projectionRecord = projection.find(projection.column('blogName').eq(operandRecord.name()));
          operand.remove(operandRecord);

          expect(removeCallback).to(haveBeenCalled, withArgs(projectionRecord));
        });
      });
    });
  });
}});
