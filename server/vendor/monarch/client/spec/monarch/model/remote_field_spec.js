//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.RemoteField", function() {
    use_local_fixtures();

    var record, remote_field;
    init(function() {
      record = User.find('jan');
      remote_field = record.remote.field('full_name');
    });

    describe("when the #value is updated", function() {
      var update_callback, old_value;

      before(function() {
        update_callback = mock_function("update callback");
        remote_field.on_update(update_callback);
        old_value = remote_field.value();
        remote_field.value("Barbie");
      });

      context("if update events are enabled on the Field's record", function() {
        it("triggers #on_update callbacks with the new and old value", function() {
          expect(update_callback).to(have_been_called, with_args("Barbie", old_value));
        });
      });

//      context("if update events are disabled on the Field's Fieldset", function() {
//        init(function() {
//          record.remote.disable_update_events();
//        });
//
//        it("does not trigger #on_update callbacks with the new and old value", function() {
//          expect(update_callback).to_not(have_been_called);
//        });
//      });
    });

  });
}});
