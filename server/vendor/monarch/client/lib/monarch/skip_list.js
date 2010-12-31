(function(Monarch) {

_.constructor("Monarch.SkipList", {
  initialize: function() {
    this.maxLevels = 8;
    this.p = 0.25;
    this.currentLevel = 0;

    this.minusInfinity = {};
    this.plusInfinity = {};

    this.head = new Monarch.SkipListNode(this.maxLevels, this.minusInfinity, undefined);
    this.nil = new Monarch.SkipListNode(this.maxLevels, this.plusInfinity, undefined);
    for (var i = 0; i < this.maxLevels; i++) {
      this.head.pointer[i] = this.nil;
      this.head.distance[i] = 1;
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
    var next = this.buildNextArray();
    var nextDistance = this.buildNextDistanceArray();
    var closestNode = this.findClosestNode(key, next, nextDistance);

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
      var newNode = new Monarch.SkipListNode(level, key, value);
      var steps = 0;
      for (var i = 0; i <= level; i++) {
        var prevNode = next[i];
        newNode.pointer[i] = prevNode.pointer[i];
        prevNode.pointer[i] = newNode;
        newNode.distance[i] = prevNode.distance[i] - steps;
        prevNode.distance[i] = steps + 1
        steps += nextDistance[i];
      }

      var maxLevels = this.maxLevels;
      for (var i = level + 1; i < maxLevels; i++) {
        next[i].distance[i] += 1;
      }

      return _.sum(nextDistance);
    }
  },

  remove: function(key) {
    var next = this.buildNextArray();
    var nextDistance = this.buildNextDistanceArray();
    var cursor = this.findClosestNode(key, next, nextDistance);

    if (this.compare(cursor.key, key) === 0) {
      for (var i = 0; i <= this.currentLevel; i++) {
        if (next[i].pointer[i] === cursor) {
          next[i].pointer[i] = cursor.pointer[i];
          next[i].distance[i] += cursor.distance[i] - 1;
        } else {
          next[i].distance[i] -= 1;
        }
      }

      // Check if we have to lower level
      while (this.currentLevel > 0 && this.head.pointer[this.currentLevel] === this.nil) {
        this.currentLevel--;
      }

      return _.sum(nextDistance);
    } else {
      return -1;
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


  nodes: function() {
    var nodes = [];
    var cursor = this.head.pointer[0];
    while(cursor !== this.nil) {
      nodes.push(cursor);
      cursor = cursor.pointer[0];
    }
    return nodes;
  },

  // private

  findClosestNode: function(key, next, nextDistance) {
    // search the skiplist in a stairstep descent, following the highest path that doesn't overshoot the key
    var cursor = this.head;
    for (var i = this.currentLevel; i >= 0; i--) {
      // move forward as far as possible while keeping the cursor node's key less than the inserted key
      while (this.compare(cursor.pointer[i].key, key) < 0) {
        if (nextDistance) nextDistance[i] += cursor.distance[i];
        cursor = cursor.pointer[i];
      }
      // when the next link would be bigger than our key, drop a level
      // before we do, note that this is the last node we visited at level i in the next array
      if (next) next[i] = cursor;
    }

    // advance to the next node... it is the nearest node whose key is >= the search key
    return cursor.pointer[0];
  },

  buildNextArray: function() {
    var maxLevels = this.maxLevels;
    var next = new Array(this.maxLevels);
    for (var i = 0; i < maxLevels; i++) {
      next[i] = this.head;
    }
    return next;
  },

  buildNextDistanceArray: function() {
    var maxLevels = this.maxLevels;
    var nextDistance = new Array(this.maxLevels);
    for (var i = 0; i < maxLevels; i++) {
      nextDistance[i] = 0;
    }
    return nextDistance;
  },

  randomLevel: function() {
    var maxLevels = this.maxLevels;
    var level = 0;
    while(Math.random() < this.p && level < maxLevels - 1) level++;
    return level;
  },

  // tests only
  html: function() {
    var nodes = this.nodes();
    var head = this.head;
    return Monarch.View.build(function(b) {
      b.div(function() {

        head.html(b);

        _.each(nodes, function(node) {
          node.html(b);
        })


        b.div({style: "clear:both"});
      });

    });
  },

});

_.constructor("Monarch.SkipListNode", {
  initialize: function(level, key, value) {
    this.key = key;
    this.value = value;
    this.level = level;
    this.pointer = new Array(level);
    this.distance = new Array(level);
  },

  // tests only
  html: function(b) {
    var level = this.level;
    var value = this.value;
    var distance = this.distance;

    with(b) {
      div({style: "text-align: center; float: left; margin-right: 10px;"}, function() {




        for(var i = 7; i >= 0; i--) {
          div({style: "border: 1px solid black; padding: 5px;"}, distance[i] || "-");
        }
        div({'class': "value"}, value);
      });
    }
  }
});

})(Monarch);
