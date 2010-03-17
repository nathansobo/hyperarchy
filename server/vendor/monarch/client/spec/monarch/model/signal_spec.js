//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Signal", function() {
    useLocalFixtures();
    var localField, remoteField, signal, transformer;

    init(function() {
      localField = Blog.find('recipes').field('name');
      remoteField = localField.remoteField();
      transformer = null;
    });

    before(function() {
      signal = new Monarch.Model.Signal(localField, remoteField, transformer);
    });


    describe("#localValue()", function() {
      context("when no transformer function is supplied", function() {
        it("returns the #value of the local field", function() {
          expect(signal.localValue()).to(eq, localField.value());
        });
      });

      context("when a transformer function is supplied", function() {
        init(function() {
          transformer = function(x) {
            return x + " transformed";
          }
        })

        it("returns the transformed #value of the local field", function() {
          expect(signal.localValue()).to(eq, transformer(localField.value()));
        });
      });
    });

    context("when the remote or local field's #values are updated", function() {
      var updateCallback, field;

      before(function() {
        updateCallback = mockFunction("update callback");
      });

      scenario("when the remote field is updated", function() {
        before(function() {
          field = remoteField;
          signal.onRemoteUpdate(updateCallback);
        });
      });

      scenario("when local field is updated", function() {
        before(function() {
          field = localField;
          signal.onLocalUpdate(updateCallback);
        });
      });

      context("when no transformer function is supplied", function() {
        it("triggers appropriate callback with the new and old #value of the field", function() {
          var originalValue = field.value()
          field.value("Cardamom");
          expect(updateCallback).to(haveBeenCalled, once);
          expect(updateCallback).to(haveBeenCalled, withArgs("Cardamom", originalValue));
        });
      });

      context("when a transformer function is supplied", function() {
        init(function() {
          transformer = function(x) {
            return x + " transformed";
          }
        })

        it("triggers onRemoteUpdate callbacks with the transformed new and old #value of the remote field", function() {
          var originalValue = field.value()
          field.value("Cardamom");
          expect(updateCallback).to(haveBeenCalled, once);
          expect(updateCallback).to(haveBeenCalled, withArgs(transformer("Cardamom"), transformer(originalValue)));
        });
      });
    });
  });
}});
