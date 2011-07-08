_.constructor("Views.Components.SortedList", View.Template, {
  content: function(params) {
    var rootTag = params.rootTag || "ol";
    var rootAttributes = params.rootAttributes || {};
    this.builder.tag(rootTag, rootAttributes);
  },

  viewProperties: {
    initialize: function() {
      this.renderQueue = new Monarch.Queue(this.renderSegmentSize || 3, this.renderDelay || 30);
    },

    relation: {
      change: function(relation) {
        this.unregisterAllInterest();
        this.empty();

        if (!relation) return;

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


        this.registerInterest(relation, 'onInsert', function(record, index) {
          var element = this.elementForRecord(record, index);
          this.insertAtIndex(element, index);
          if (this.onInsert) this.onInsert(record, element);
        });

        this.registerInterest(relation, 'onUpdate', function(record, changes, newIndex, oldIndex) {
          var element = this.elementForRecord(record, newIndex);
          this.insertAtIndex(element.detach(), newIndex);
          if (this.onUpdate) this.onUpdate(element, record, changes, newIndex, oldIndex);
        });

        this.registerInterest(relation, 'onRemove', function(record, index) {
          var element = this.elementForRecord(record, index);
          element.remove();
          delete this.elementsById[record.id()];
          if (this.onRemove) this.onRemove(element, record, index);
        });
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