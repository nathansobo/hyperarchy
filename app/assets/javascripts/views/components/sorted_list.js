_.constructor("Views.Components.SortedList", View.Template, {
  content: function(params) {
    var rootTag = params.rootTag || "ol";
    var rootAttributes = params.rootAttributes || {};
    this.builder.tag(rootTag, rootAttributes);
  },

  viewProperties: {
    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle();
      this.renderQueue = new Monarch.Queue(this.renderSegmentSize || 3, this.renderDelay || 30);
    },

    relation: {
      change: function(relation) {
        if (this.subscriptions) this.subscriptions.destroy();

        this.empty();
        if (this.useQueue) {
          relation.each(function(record, index) {
            this.renderQueue.add(function() {
              var element = this.elementForRecord(record, index);
              this.append(element);
              if (element.attach) element.attach();
            }, this);
          }, this);
          this.renderQueue.start();
        } else {
          relation.each(function(record, index) {
            var element = this.elementForRecord(record, index);
            this.append(element);
            if (element.attach) element.attach();
          }, this);
        }

        this.subscriptions.add(relation.onInsert(function(record, index) {
          var element = this.elementForRecord(record, index);
          this.insertAtIndex(element, index);
          if (this.onInsert) this.onInsert(record, element);
        }, this));

        this.subscriptions.add(relation.onUpdate(function(record, changes, index) {
          var element = this.elementForRecord(record, index);
          this.insertAtIndex(element.detach(), index);
          if (this.onUpdate) this.onUpdate(element, record, changes, index);
        }, this));

        this.subscriptions.add(relation.onRemove(function(record, index) {
          var element = this.elementForRecord(record, index);
          element.remove();
          if (this.onRemove) this.onRemove(element, record, index);
        }, this));
      }
    },

    insertAtIndex: function(element, index) {
      element.detach();
      var insertBefore = this.find("> :eq(" + index + ")");

      if (insertBefore.length > 0) {
        insertBefore.before(element);
      } else {
        this.append(element);
      }
      if (element.attach) element.attach();
      this.updateIndices();
    },

    elementForRecord: function(record, index) {
      var id = record.id();
      if (this.elementsById[id]) {
        return this.elementsById[id];
      } else {
        return this.elementsById[id] = this.buildElement(record, index);
      }
    },

    afterRemove: function() {
      this.subscriptions.destroy();
    },

    updateIndices: function() {
      if (!this.updateIndex) return;
      var self = this;
      this.children().each(function(index) {
        self.updateIndex($(this), index);
      });
    },

    empty: function() {
      this.renderQueue.clear();
      if (this.elementsById) {
        _.each(this.elementsById, function(element) {
          element.remove();
        });
      }
      this.elementsById = {};
    }
  }
});