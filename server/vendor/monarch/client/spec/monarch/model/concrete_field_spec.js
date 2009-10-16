//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.ConcreteField", function() {
    use_local_fixtures();

    var record, field;
    init(function() {
      record = User.find('jan');
    });

    describe("#value(value)", function() {
      context("when the #column's type is 'datetime'", function() {
        before(function() {
          field = record.field('signed_up_at')
          expect(field.column.type).to(equal, 'datetime');
        });

        context("when a Date object is assigned", function() {
          it("assigns the Date object without converting it", function() {
            var date = new Date();
            field.value(date);
            expect(field.value()).to(equal, date);
          });
        });

        context("when an integer is assigned", function() {
          it("converts the integer to a Date object", function() {
            var date = new Date();
            var millis = date.getTime();
            field.value(millis);
            
            var value = field.value();
            expect(value instanceof Date).to(be_true);
            expect(field.value()).to(equal, date);
          });
        });
      });
    });
    

    describe("when the #value is updated", function() {
      var update_callback, old_value;

      before(function() {
        field = record.field('full_name');
        update_callback = mock_function("update callback");
        field.on_update(update_callback);
        old_value = field.value();
        field.value("Barbie");
      });

      context("if update events are enabled on the Field's record", function() {
        it("triggers #on_update callbacks with the new and old value", function() {
          expect(update_callback).to(have_been_called, with_args("Barbie", old_value));
        });
      });

      context("if update events are disabled on the Field's Fieldset", function() {
        init(function() {
          record.active_fieldset.disable_update_events();
        });

        it("does not trigger #on_update callbacks with the new and old value", function() {
          expect(update_callback).to_not(have_been_called);
        });
      });
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
