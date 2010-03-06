(function(Monarch) {

Monarch.constructor("Monarch.Queue", {
  constructorInitialize: function() {
    this.synchronous = false;
  },

  initialize: function(segmentSize, delay) {
    this.segmentSize = segmentSize || 1;
    this.delay = delay || 0;
    this.fns = [];
    this.started = false;
  },

  add: function(fn) {
    this.fns.push(fn)
  },

  addTimeCritical: function(fn) {
    fn.timeCritical = true;
    this.fns.push(fn)
  },

  start: function() {
    if (Monarch.Queue.synchronous) {
      this.synchronousStart();
    } else {
      this.asynchronousStart();
    }
  },

  synchronousStart: function() {
    var fns = this.fns;
    while(fns.length > 0) {
      fns.shift()();
    }
  },

  asynchronousStart: function() {
    if (this.started) return;
    var self = this;
    var delay = this.delay;
    var segmentSize = this.segmentSize;
    var fns = this.fns;

    var processNextSegment = function() {
      for (var i = 0; i < segmentSize && fns.length > 0; i++) {
        var fn = fns.shift()
        fn();
        if (fn.timeCritical) break;
      }
      if (fns.length > 0) {
        setTimeout(function() { processNextSegment(); }, delay);
      } else {
        self.started = false;
      }
    };

    this.started = true;
    processNextSegment();
  },

  clear: function() {
    this.fns.length = 0;
    this.started = false;
  }
})

})(Monarch);
