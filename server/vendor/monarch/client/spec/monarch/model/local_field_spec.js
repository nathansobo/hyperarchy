//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.LocalField", function() {
    use_local_fixtures();

    var record, field;
    init(function() {
      record = User.find('jan');
    });

    describe("#value_wire_representation()", function() {
      context("when the #column's type is 'datetime'", function() {
        it("returns the milliseconds integer for the Field's #value or null", function() {
          field = record.field('signed_up_at')
          expect(field.value_wire_representation()).to(equal, field.value().getTime());
          field.value(null);
          expect(field.value_wire_representation()).to(equal, null);
        });
      });
    });
  });
}});
