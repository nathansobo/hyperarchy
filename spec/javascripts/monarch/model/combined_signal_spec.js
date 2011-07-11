//= require monarch_spec_helper

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.CombinedSignal", function() {
    useLocalFixtures();
    var record, signalA, signalB, combinedSignal, transformer;

    init(function() {
      transformer = mockFunction('transformer', function() {
        return 'mock transformed value';
      });
    });

    before(function() {
      record = Blog.fixture('recipes');
      signalA = record.signal('name');
      signalB = record.signal('userId');
      combinedSignal = new Monarch.Model.CombinedSignal(signalA, signalB, transformer);
    });

    describe("value methods", function() {
      before(function() {
        record.name('Driving Carefully');
        record.userId('mom');
        expect(signalA.localValue()).toNot(equal, signalA.remoteValue());
        expect(signalB.localValue()).toNot(equal, signalB.remoteValue());
      });

      describe("#localValue()", function() {
        it("returns the value of the transformer applied to the #localValues of the combined signals", function() {
          expect(combinedSignal.localValue()).to(eq, 'mock transformed value');
          expect(transformer).to(haveBeenCalled, withArgs(signalA.localValue(), signalB.localValue()));
        });
      });

      describe("#remoteValue()", function() {
        it("returns the value of the transformer applied to the #localValues of the combined signals", function() {
          expect(combinedSignal.remoteValue()).to(eq, 'mock transformed value');
          expect(transformer).to(haveBeenCalled, withArgs(signalA.remoteValue(), signalB.remoteValue()));
        });
      });
    });

    describe("when the remote value of one of the operand signals changes", function() {
      useFakeServer();

      var onRemoteUpdateCallback;
      before(function() {
        onRemoteUpdateCallback = mockFunction('onRemoteUpdateCallback');
        combinedSignal.onRemoteUpdate(onRemoteUpdateCallback);
      });

      context("if the transformer applied to the new operand's remote value returns a different result", function() {
        init(function() {
          transformer = function(a, b) {
            return a + b;
          }
        })

        it("fires onRemoteUpdate handlers", function() {
          record.save();
          var expectedOldValue = transformer(signalA.remoteValue(), signalB.remoteValue())
          record.update({name: 'June'});
          var expectedNewValue = transformer(signalA.remoteValue(), signalB.remoteValue());
          expect(onRemoteUpdateCallback).to(haveBeenCalled, once);
          expect(onRemoteUpdateCallback).to(haveBeenCalled, withArgs(expectedNewValue, expectedOldValue));
          onRemoteUpdateCallback.clear();

          expectedOldValue = transformer(signalA.remoteValue(), signalB.remoteValue())
          record.update({userId: 'nathan'});
          expectedNewValue = transformer(signalA.remoteValue(), signalB.remoteValue());
          expect(onRemoteUpdateCallback).to(haveBeenCalled, withArgs(expectedNewValue, expectedOldValue));
        });
      });

      context("if the transformer applied to the new operand's remote value returns the same result", function() {
        // mock transformer function returns constant value

        it("does not fire onRemoteUpdate handlers", function() {
          record.update({name: 'June', userId: 'nathan'});
          expect(onRemoteUpdateCallback).toNot(haveBeenCalled);
        });
      });
    });
  });
}});
