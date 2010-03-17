//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.RemoteField", function() {
    useLocalFixtures();

    var record, remoteField;
    init(function() {
      record = User.find('jan');
      remoteField = record.remote.field('fullName');
    });

    describe("#value(newValue)", function() {
      context("when the type of the field is 'datetime'", function() {
        it("coerces integers to Dates", function() {
          var timeMillis = new Date().getTime();
          record.signedUpAt(timeMillis);
          expect(record.signedUpAt().getTime()).to(equal, timeMillis);
        });
      });

      context("when the type of the field is 'key' and Monarch.Model.allow_string_keys is false", function() {
        before(function() {
          Monarch.Model.allowStringKeys = false;
        });

        after(function() {
          Monarch.Model.allowStringKeys = true;
        });

        it("coerces strings to integers", function() {
          var blog = Blog.table.createFromRemote({id: "1"});
          expect(blog.id()).to(eq, 1);
        });
      });
    });

    describe("when the #value is updated", function() {
      var updateCallback, oldValue;

      before(function() {
        updateCallback = mockFunction("update callback");
        remoteField.onUpdate(updateCallback);
        oldValue = remoteField.value();
        remoteField.value("Barbie");
      });

      context("if update events are enabled on the Field's record", function() {
        it("triggers #onRemoteUpdate callbacks with the new and old value", function() {
          expect(updateCallback).to(haveBeenCalled, withArgs("Barbie", oldValue));
        });
      });
    });
  });
}});
