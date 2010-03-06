//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.RemoteField", function() {
    useLocalFixtures();

    var record, remoteField;
    init(function() {
      record = User.find('jan');
      remoteField = record.remote.field('fullName');
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

//      context("if update events are disabled on the Field's Fieldset", function() {
//        init(function() {
//          record.remote.disableUpdateEvents();
//        });
//
//        it("does not trigger #onRemoteUpdate callbacks with the new and old value", function() {
//          expect(updateCallback).toNot(haveBeenCalled);
//        });
//      });
    });

  });
}});
