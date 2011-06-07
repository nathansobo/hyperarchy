//= require monarch_spec_helper

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.LocalField", function() {
    useLocalFixtures();

    var record, field;
    init(function() {
      record = User.fixture('jan');
    });

    describe("#valueWireRepresentation()", function() {
      context("when the #column's type is 'datetime'", function() {
        it("returns the milliseconds integer for the Field's #value or null", function() {
          field = record.field('signedUpAt')
          expect(field.valueWireRepresentation()).to(eq, field.value().getTime());
          field.value(null);
          expect(field.valueWireRepresentation()).to(eq, null);
        });
      });
    });

    describe("#value(newValue)", function() {
      context("when the local field value becomes the same as the remote field value", function() {
        it("marks the field as clean, clears its validation errors, and triggers onValid callbacks on its record if this was the last invalid field to become valid", function() {
          field = record.field('age');
          field.value(50);
          field.assignValidationErrors(["some error"]);

          var onValidCallback = mockFunction();
          record.onValid(onValidCallback);

          expect(field.dirty()).to(beTrue);
          expect(field.valid()).to(beFalse);

          field.value(record.remote.age());

          expect(onValidCallback).to(haveBeenCalled);
          expect(field.dirty()).to(beFalse);
          expect(field.valid()).to(beTrue);
        });
      });
    });
  });
}});
