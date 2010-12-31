(function(Monarch) {

_.constructor("Monarch.SkipList", {
  initialize: function() {
    this.maxLevels = 8;
    this.p = 0.25;
    this.currentLevel = 0;


    this.minusInfinity = {};
    this.plusInfinity = {};

    this.head = new Monarch.SkipListNode(this.maxLevels, Number.MIN_VALUE, undefined);
    this.nil = new Monarch.SkipListNode(this.maxLevels, Number.MAX_VALUE, undefined);
    for (var i = 0; i < this.maxLevels; i++) {
      this.head.pointer[i] = this.nil;
    }
  },

  compare: function(a, b) {
    if (a === this.minusInfinity) return (b === this.minusInfinity) ? 0 : -1;
    if (b === this.minusInfinity) return (a === this.minusInfinity) ? 0 : 1;
    if (a === this.plusInfinity) return (b === this.plusInfinity) ? 0 : 1;
    if (b === this.plusInfinity) return (a === this.plusInfinity) ? 0 : -1;
    if (a < b) return - 1;
    if (a > b) return 1;
    return 0;
  },

  insert: function(key, value) {
    if (!value) value = key;
    var next = new Array(this.maxLevels);
    var closestNode = this.findClosestNode(key, next);

    // if the key is a duplicate, replace its value. otherwise insert a node
    if (closestNode.key == key) {
      closestNode.value = value;
    } else {
      var level = this.randomLevel();

      // if the overall level in increasing, set the new level and fill in the next array with this.head for the new levels
      if (level > this.currentLevel) {
        for (i = this.currentLevel + 1; i <= level; i++) next[i] = this.head;
        this.currentLevel = level;
      }

      // create a new node and insert it by updating pointers at every level
      closestNode = new Monarch.SkipListNode(level, key, value);
      for (i = 0; i <= level; i++) {
        closestNode.pointer[i] = next[i].pointer[i];
        next[i].pointer[i] = closestNode;
      }
    }
  },

  remove: function(key) {
    var next = new Array(this.maxLevels);
    var cursor = this.findClosestNode(key, next);

    if (this.compare(cursor.key, key) === 0) {
      for (i = 0; i <= this.currentLevel; i++) {
        if (next[i].pointer[i] === cursor) {
          next[i].pointer[i] = cursor.pointer[i];
        }
      }

      // Check if we have to lower level
      while (this.currentLevel > 0 && this.head.pointer[this.currentLevel] === this.nil) {
        console.debug("lowering level");
        this.currentLevel--;
      }
    }
  },

  find: function(key) {
    var cursor = this.findClosestNode(key, false);
    if (this.compare(cursor.key, key) === 0) {
      return cursor.value;
    } else {
      return undefined;
    }
  },

  values: function() {
    var values = [];
    var cursor = this.head.pointer[0];
    while(cursor !== this.nil) {
      values.push(cursor.value);
      cursor = cursor.pointer[0];
    }
    return values;
  },

  // private

  findClosestNode: function(key, next) {
    // search the skiplist in a stairstep descent, following the highest path that doesn't overshoot the key
    var cursor = this.head;
    for (var i = this.currentLevel; i >= 0; i--) {
      // move forward as far as possible while keeping the cursor node's key less than the inserted key
      while (this.compare(cursor.pointer[i].key, key) < 0) {
        cursor = cursor.pointer[i];
      }
      // when the next link would be bigger than our key, drop a level
      // before we do, note that this is the last node we visited at level i in the next array
      if (next) next[i] = cursor;
    }

    // advance to the next node... it is the nearest node whose key is >= the search key
    return cursor.pointer[0];
  },


  randomLevel: function() {
    var maxLevels = this.maxLevels;
    var level = 0;
    while(Math.random() < this.p && level < maxLevels) level++;
    return level;
  }
});


_.constructor("Monarch.SkipListNode", {
  initialize: function(level, key, value) {
    this.key = key;
    this.value = value;
    this.level = level;
    this.pointer = new Array(level);
  }
});

})(Monarch);
