_.constructor("Views.SortedList", View.Template, {
  content: function(params) {
    var olAttributes = params.olAttributes || {};
    this.builder.ol(olAttributes);
  },

  viewProperties: {

    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle();
    },

    relation: {
      afterChange: function(relation) {
        if (this.subscriptions) this.subscriptions.destroy();

        if (this.lisById) {
          _.each(this.lisById, function(li) {
            li.remove();
          });
        }
        this.lisById = {};

        relation.each(function(record) {
          this.append(this.liForRecord(record));
        }, this);

        this.subscriptions.add(relation.onRemoteInsert(function(record, index) {
          this.insertAtIndex(this.liForRecord(record), index);
        }, this));

        this.subscriptions.add(relation.onRemoteUpdate(function(record, changes, index) {
          var li = this.liForRecord(record);
          this.insertAtIndex(li, index);
          if (this.onRemoteUpdate) this.onRemoteUpdate(record, changes, li);
        }, this));

        this.subscriptions.add(relation.onRemoteRemove(function(record, index) {
          this.liForRecord(record).remove();
        }, this));
      }
    },

    insertAtIndex: function(li, index) {
      li.detach();
      var insertBefore = this.find("> :eq(" + index + ")");

      if (insertBefore.length > 0) {
        insertBefore.before(li);
      } else {
        this.append(li);
      }
    },

    liForRecord: function(record) {
      var id = record.id();
      if (this.lisById[id]) {
        return this.lisById[id].detach();
      } else {
        return this.lisById[id] = this.buildLi(record);
      }
    },

    remove: function($super) {
      $super();
      this.subscriptions.destroy();
    }
  }
});