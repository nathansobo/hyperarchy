constructor("Queue", {
  constructor_initialize: function() {
    this.synchronous = false;
  },

  initialize: function(segment_size, delay) {
    this.segment_size = segment_size || 1;
    this.delay = delay || 0;
    this.fns = [];
    this.started = false;
  },

  add: function(fn) {
    this.fns.push(fn)
  },

  add_time_critical: function(fn) {
    fn.time_critical = true;
    this.fns.push(fn)
  },

  start: function() {
    if (Queue.synchronous) {
      this.synchronous_start();
    } else {
      this.asynchronous_start();
    }
  },

  synchronous_start: function() {
    var fns = this.fns;
    while(fns.length > 0) {
      fns.shift()();
    }
  },

  asynchronous_start: function() {
    if (this.started) return;
    var self = this;
    var delay = this.delay;
    var segment_size = this.segment_size;
    var fns = this.fns;

    var process_next_segment = function() {
      for (var i = 0; i < segment_size && fns.length > 0; i++) {
        var fn = fns.shift()
        fn();
        if (fn.time_critical) break;
      }
      if (fns.length > 0) {
        setTimeout(function() { process_next_segment(); }, delay);
      } else {
        self.started = false;
      }
    };

    this.started = true;
    process_next_segment();
  },

  clear: function() {
    this.fns.length = 0;
    this.started = false;
  }
})
