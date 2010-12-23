//= require "../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Queue", function() {
    var queue, fn1, fn2, fn3, context1, context2;

    before(function() {
      Monarch.Queue.synchronous = false;
      mock(window, 'setTimeout');
      queue = new Monarch.Queue(2, 2);

      context1 = { context: 1 };
      context2 = { context: 2 };


      fn1 = mockFunction('fn 1');
      fn2 = mockFunction('fn 2');
      fn3 = mockFunction('fn 3');
    });

    describe("#start", function() {
      before(function() {
        queue.add(fn1, context1);
        queue.add(fn2, context2);
        queue.add(fn3, context1);
      });

      context("when the Monarch.Queue has not yet started", function() {
        it("processes each enqueued function in its appropriate context, separating segments (based on #segmentSize) with a setTimeout delay (based on #delay)", function() {
          queue.start();
          expect(queue.started).to(beTrue);
          expect(fn1).to(haveBeenCalled, once);
          expect(fn1.mostRecentThisValue).to(eq, context1);

          expect(fn2).to(haveBeenCalled, once);
          expect(fn2.mostRecentThisValue).to(eq, context2);

          expect(fn3).toNot(haveBeenCalled);

          expect(window.setTimeout).to(haveBeenCalled, once);
          expect(window.setTimeout.mostRecentArgs[1]).to(eq, 2);

          window.setTimeout.mostRecentArgs[0]();

          expect(fn3).to(haveBeenCalled);
          expect(fn3.mostRecentThisValue).to(eq, context1);

          expect(queue.started).to(beFalse);
        });
      });

      context("when the Monarch.Queue has already been started", function() {
        it("does not start it again", function() {
          queue.start();
          expect(queue.started).to(beTrue);

          expect(fn1).to(haveBeenCalled, once);
          expect(fn2).to(haveBeenCalled, once);

          expect(fn3).toNot(haveBeenCalled);
          expect(window.setTimeout).to(haveBeenCalled, once);

          // starting a second time does not add another setTimeout
          queue.start();
          expect(window.setTimeout).to(haveBeenCalled, once);

          window.setTimeout.mostRecentArgs[0]();
          expect(fn3).to(haveBeenCalled, once);
        });
      });

      context("when Monarch.Queue.synchronous is true", function() {
        before(function() {
          Monarch.Queue.synchronous = true;
        });

        it("does not call setTimeout between segments", function() {
          queue.start();
          expect(fn1).to(haveBeenCalled, once);
          expect(fn2).to(haveBeenCalled, once);
          expect(fn3).to(haveBeenCalled, once);
          expect(window.setTimeout).toNot(haveBeenCalled);
        });
      });
    });

    describe("#clear", function() {
      before(function() {
        queue.add(fn1);
        queue.add(fn2);
        queue.add(fn3);
      });

      it("stops empties the queue, stopping it from processing any remaining functions added before the call to #clear", function() {
        queue.start();
        expect(fn1).to(haveBeenCalled, once);
        expect(fn2).to(haveBeenCalled, once);
        expect(fn3).toNot(haveBeenCalled);

        // simulate a clear and add called in the pause between segments
        queue.clear();
        var fn4 = mockFunction("fn 4");
        queue.add(fn4)

        window.setTimeout.mostRecentArgs[0]();

        // the function added after the clear is still called
        expect(fn3).toNot(haveBeenCalled);
        expect(fn4).to(haveBeenCalled, once);

        fn4.clear();
        queue.start();
        expect(fn4).toNot(haveBeenCalled);
      });
    });

    describe("#addTimeCritical", function() {
      it("causes the Monarch.Queue to yield immediately after executing the added function", function() {
        queue.addTimeCritical(fn1);
        queue.add(fn2);
        queue.add(fn3);

        queue.start();
        expect(fn1).to(haveBeenCalled, once);
        expect(fn2).toNot(haveBeenCalled);

        window.setTimeout.mostRecentArgs[0]();
        expect(fn2).to(haveBeenCalled, once);
        expect(fn3).to(haveBeenCalled, once);
        expect(queue.started).to(beFalse);
      });
    });
  });
}});
