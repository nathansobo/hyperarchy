//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.CombinedSignal", function() {
    use_local_fixtures();
    var record, signal_a, signal_b, combined_signal, transformer;

    init(function() {
      transformer = mock_function('transformer', function() {
        return 'mock transformed value';
      });
    });

    before(function() {
      record = Blog.find('recipes');
      signal_a = record.signal('name');
      signal_b = record.signal('user_id');
      combined_signal = new Monarch.Model.CombinedSignal(signal_a, signal_b, transformer);
    });

    describe("value methods", function() {
      before(function() {
        record.name('Driving Carefully');
        record.user_id('mom');
        expect(signal_a.local_value()).to_not(equal, signal_a.remote_value());
        expect(signal_b.local_value()).to_not(equal, signal_b.remote_value());
      });

      describe("#local_value()", function() {
        it("returns the value of the transformer applied to the #local_values of the combined signals", function() {
          expect(combined_signal.local_value()).to(equal, 'mock transformed value');
          expect(transformer).to(have_been_called, with_args(signal_a.local_value(), signal_b.local_value()));
        });
      });

      describe("#remote_value()", function() {
        it("returns the value of the transformer applied to the #local_values of the combined signals", function() {
          expect(combined_signal.remote_value()).to(equal, 'mock transformed value');
          expect(transformer).to(have_been_called, with_args(signal_a.remote_value(), signal_b.remote_value()));
        });
      });
    });

    describe("when the remote value of one of the operand signals changes", function() {
      use_fake_server();

      var on_remote_update_callback;
      before(function() {
        on_remote_update_callback = mock_function('on_remote_update_callback');
        combined_signal.on_remote_update(on_remote_update_callback);
      });

      context("if the transformer applied to the new operand's remote value returns a different result", function() {
        init(function() {
          transformer = function(a, b) {
            return a + b;
          }
        })

        it("fires on_remote_update handlers", function() {
          record.save();
          var expected_old_value = transformer(signal_a.remote_value(), signal_b.remote_value())
          record.update({name: 'June'});
          var expected_new_value = transformer(signal_a.remote_value(), signal_b.remote_value());
          expect(on_remote_update_callback).to(have_been_called, once);
          expect(on_remote_update_callback).to(have_been_called, with_args(expected_new_value, expected_old_value));
          on_remote_update_callback.clear();

          expected_old_value = transformer(signal_a.remote_value(), signal_b.remote_value())
          record.update({user_id: 'nathan'});
          expected_new_value = transformer(signal_a.remote_value(), signal_b.remote_value());
          expect(on_remote_update_callback).to(have_been_called, with_args(expected_new_value, expected_old_value));
        });
      });

      context("if the transformer applied to the new operand's remote value returns the same result", function() {
        // mock transformer function returns constant value

        it("does not fire on_remote_update handlers", function() {
          record.update({name: 'June', user_id: 'nathan'});
          expect(on_remote_update_callback).to_not(have_been_called);
        });
      });
    });
  });
}});
