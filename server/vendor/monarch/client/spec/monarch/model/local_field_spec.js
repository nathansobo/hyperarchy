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

    describe("#value(new_value)", function() {
      context("when the local field value becomes the same as the remote field value", function() {
        it("marks the field as clean, clears its validation errors, and triggers on_valid callbacks on its record if this was the last invalid field to become valid", function() {
          field = record.field('age');
          field.value(50);
          field.assign_validation_errors(["some error"]);

          var on_valid_callback = mock_function();
          record.on_valid(on_valid_callback);

          expect(field.dirty()).to(be_true);
          expect(field.valid()).to(be_false);

          field.value(record.remote.age());

          expect(on_valid_callback).to(have_been_called);
          expect(field.dirty()).to(be_false);
          expect(field.valid()).to(be_true);
        });
      });
    });
  });
}});
