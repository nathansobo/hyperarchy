//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Signal", function() {
    use_local_fixtures();
    var local_field, remote_field, signal, transformer;

    init(function() {
      local_field = Blog.find('recipes').field('name');
      remote_field = local_field._remote_field;
      transformer = null;
    });

    before(function() {
      signal = new Monarch.Model.Signal(local_field, remote_field, transformer);
    });


    describe("#local_value()", function() {
      context("when no transformer function is supplied", function() {
        it("returns the #value of the local field", function() {
          expect(signal.local_value()).to(equal, local_field.value());
        });
      });

      context("when a transformer function is supplied", function() {
        init(function() {
          transformer = function(x) {
            return x + " transformed";
          }
        })

        it("returns the transformed #value of the local field", function() {
          expect(signal.local_value()).to(equal, transformer(local_field.value()));
        });
      });
    });

    context("when the remote or local field's #values are updated", function() {
      var update_callback, field;

      before(function() {
        update_callback = mock_function("update callback");
      });

      scenario("when the remote field is updated", function() {
        before(function() {
          field = remote_field;
          signal.on_remote_update(update_callback);
        });
      });

      scenario("when local field is updated", function() {
        before(function() {
          field = local_field;
          signal.on_local_update(update_callback);
        });
      });

      context("when no transformer function is supplied", function() {
        it("triggers appropriate callback with the new and old #value of the field", function() {
          var original_value = field.value()
          field.value("Cardamom");
          expect(update_callback).to(have_been_called, once);
          expect(update_callback).to(have_been_called, with_args("Cardamom", original_value));
        });
      });

      context("when a transformer function is supplied", function() {
        init(function() {
          transformer = function(x) {
            return x + " transformed";
          }
        })

        it("triggers on_remote_update callbacks with the transformed new and old #value of the remote field", function() {
          var original_value = field.value()
          field.value("Cardamom");
          expect(update_callback).to(have_been_called, once);
          expect(update_callback).to(have_been_called, with_args(transformer("Cardamom"), transformer(original_value)));
        });
      });
    });
  });
}});
