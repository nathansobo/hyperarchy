//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Model.Signal", function() {
    use_local_fixtures();
    var field, source, signal, transformer;

    init(function() {
      field = Blog.find('recipes').field('name');
      transformer = null;
      source = null;
    });

    before(function() {
      signal = new Model.Signal(source, transformer);
    });

    scenario("when the #source is a Field", function() {
      init(function() {
        source = field;
      });
    });

    scenario("when the #source is another Signal", function() {
      init(function() {
        source = field.signal();
      });
    });

    describe("#value()", function() {
      context("when no transformer function is supplied", function() {
        it("returns the #value of the source", function() {
          expect(signal.value()).to(equal, source.value());
        });
      });

      context("when a transformer function is supplied", function() {
        init(function() {
          transformer = function(x) {
            return x + " transformed";
          }
        })

        it("returns the transformed #value of the source", function() {
          expect(signal.value()).to(equal, transformer(source.value()));
        });
      });
    });

    context("when the source's #value is updated", function() {
      var update_callback;
      before(function() {
        update_callback = mock_function("update callback");
        signal.on_update(update_callback);
      });

      context("when no transformer function is supplied", function() {
        it("triggers update callbacks with the new and old #value of the source", function() {
          var original_value = source.value()
          field.value("Cardamom");
          var new_value = source.value();
          expect(update_callback).to(have_been_called, once);
          expect(update_callback).to(have_been_called, with_args(new_value, original_value));
        });
      });

      context("when a transformer function is supplied", function() {
        init(function() {
          transformer = function(x) {
            return x + " transformed";
          }
        })

        it("triggers update callbacks with the transformed new and old #value of the source", function() {
          var original_value = source.value()
          field.value("Cardamom");
          var new_value = source.value();
          expect(update_callback).to(have_been_called, once);
          expect(update_callback).to(have_been_called, with_args(transformer(new_value), transformer(original_value)));
        });
      });
    });

    describe("#signal", function() {
      it("returns a Signal based on the receiver", function() {
        var secondary_signal = signal.signal();
        expect(secondary_signal instanceof Model.Signal).to(be_true);
        expect(secondary_signal.source).to(equal, signal);
      });
    });
  });
}});
