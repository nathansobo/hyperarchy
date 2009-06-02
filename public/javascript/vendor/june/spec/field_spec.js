require("/specs/june_spec_helper");

Screw.Unit(function(c) { with(c) {
  describe("Field", function() {
    var field, tuple;
    before(function() {
      tuple = User.find("bob")
      field = tuple.fields.first_name;
    });

    
    describe("#set_value", function() {
      var update_callback;
      before(function() {
        update_callback = mock_function("update callback")
        field.on_update(update_callback);
      });

      it("calls #attribute.convert on the value before it is set", function() {
        var convert_args = [];
        field.attribute.convert = function(arg) {
          convert_args.push(arg);
          return arg + "'";
        }
        
        field.set_value("foo");
        expect(convert_args).to(equal, ["foo"]);
        expect(field.value).to(equal, "foo'");
      });

      context("when #update_notification_disabled is true on the parent tuple", function() {
        before(function() {
          expect(tuple.update_notification_enabled).to(be_true);
        });

        it("triggers #on_update handlers", function() {
          field.set_value("foo");
          expect(update_callback).to(have_been_called);
        });
      });

      context("when #update_notification_disabled is false on the parent tuple", function() {
        before(function() {
          tuple.update_notification_enabled = false;
        });

        it("does not trigger #on_update handlers", function() {
          field.set_value("foo");
          expect(update_callback).to_not(have_been_called);
        });
      });
    });
    
    describe("#on_update", function() {
      it("returns a Subscription that is triggered with the new and old values when the field is updated", function() {
        var update_callback = mock_function("update callback", function(new_value, old_value) {
          expect(field.get_value()).to(equal, new_value);
        });
        var subscription = field.on_update(update_callback);
        field.set_value("foo");
        expect(update_callback).to(have_been_called, with_args("foo", "Bob"));
        field.set_value("bar");
        expect(update_callback).to(have_been_called, with_args("bar", "foo"));
        subscription.destroy();
        field.set_value("baz");
        expect(update_callback).to_not(have_been_called, with_args("baz", "bar"));
      });
    });
  });
}});
    