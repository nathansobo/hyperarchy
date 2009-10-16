//= require "../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Queue", function() {
    var queue, fn_1, fn_2, fn_3;

    before(function() {
      Monarch.Queue.synchronous = false;
      mock(window, 'setTimeout');
      queue = new Monarch.Queue(2, 2);

      fn_1 = mock_function('fn 1');
      fn_2 = mock_function('fn 2');
      fn_3 = mock_function('fn 3');
    });

    describe("#start", function() {
      before(function() {
        queue.add(fn_1);
        queue.add(fn_2);
        queue.add(fn_3);
      });

      context("when the Monarch.Queue has not yet started", function() {
        it("processes each enqueued function, separating segments (based on #segment_size) with a setTimeout delay (based on #delay)", function() {
          queue.start();
          expect(queue.started).to(be_true);
          
          expect(fn_1).to(have_been_called, once);
          expect(fn_2).to(have_been_called, once);

          expect(fn_3).to_not(have_been_called);

          expect(window.setTimeout).to(have_been_called, once);
          expect(window.setTimeout.most_recent_args[1]).to(equal, 2);

          window.setTimeout.most_recent_args[0]();

          expect(fn_3).to(have_been_called);
          expect(queue.started).to(be_false);
        });
      });

      context("when the Monarch.Queue has already been started", function() {
        it("does not start it again", function() {
          queue.start();
          expect(queue.started).to(be_true);

          expect(fn_1).to(have_been_called, once);
          expect(fn_2).to(have_been_called, once);

          expect(fn_3).to_not(have_been_called);
          expect(window.setTimeout).to(have_been_called, once);

          // starting a second time does not add another setTimeout
          queue.start();
          expect(window.setTimeout).to(have_been_called, once);

          window.setTimeout.most_recent_args[0]();
          expect(fn_3).to(have_been_called, once);
        });
      });

      context("when Monarch.Queue.synchronous is true", function() {
        before(function() {
          Monarch.Queue.synchronous = true;
        });

        it("does not call setTimeout between segments", function() {
          queue.start();
          expect(fn_1).to(have_been_called, once);
          expect(fn_2).to(have_been_called, once);
          expect(fn_3).to(have_been_called, once);
          expect(window.setTimeout).to_not(have_been_called);
        });
      });
    });

    describe("#clear", function() {
      before(function() {
        queue.add(fn_1);
        queue.add(fn_2);
        queue.add(fn_3);
      });

      it("stops empties the queue, stopping it from processing any remaining functions added before the call to #clear", function() {
        queue.start();
        expect(fn_1).to(have_been_called, once);
        expect(fn_2).to(have_been_called, once);
        expect(fn_3).to_not(have_been_called);

        // simulate a clear and add called in the pause between segments
        queue.clear();
        var fn_4 = mock_function("fn 4");
        queue.add(fn_4)

        window.setTimeout.most_recent_args[0]();

        // the function added after the clear is still called
        expect(fn_3).to_not(have_been_called);
        expect(fn_4).to(have_been_called, once);

        fn_4.clear();
        queue.start();
        expect(fn_4).to_not(have_been_called);
      });
    });

    describe("#add_time_critical", function() {
      it("causes the Monarch.Queue to yield immediately after executing the added function", function() {
        queue.add_time_critical(fn_1);
        queue.add(fn_2);
        queue.add(fn_3);

        queue.start();
        expect(fn_1).to(have_been_called, once);
        expect(fn_2).to_not(have_been_called);

        window.setTimeout.most_recent_args[0]();
        expect(fn_2).to(have_been_called, once);
        expect(fn_3).to(have_been_called, once);
        expect(queue.started).to(be_false);
      });
    });
  });
}});
