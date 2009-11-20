(function(Monarch) {

Monarch.constructor("Monarch.Model.Relations.Relation", {
  has_operands: true,

  initialize_events_system: function() {
    this.on_insert_node = new Monarch.SubscriptionNode();
    this.on_remove_node = new Monarch.SubscriptionNode();
    this.on_update_node = new Monarch.SubscriptionNode();
    if (this.has_operands) {
      this.operands_subscription_bundle = new Monarch.SubscriptionBundle();
      this.unsubscribe_from_operands_when_this_relation_no_longer_has_subscribers();
    }
  },

  where: function(predicate) {
    return new Monarch.Model.Relations.Selection(this, predicate);
  },

  order_by: function() {
    var self = this;
    var order_by_columns = Monarch.Util.map(Monarch.Util.to_array(arguments), function(order_by_column) {
      if (order_by_column instanceof Monarch.Model.OrderByColumn) {
        return order_by_column;
      } else if (order_by_column instanceof Monarch.Model.Column) {
        return order_by_column.asc();
      } else if (typeof order_by_column == "string") {
        var parts = order_by_column.split(/ +/);
        var column_name = parts[0];
        var direction = parts[1] || 'asc';
        if (direction == 'desc') {
          return self.primary_table().columns_by_name[column_name].desc();
        } else {
          return self.primary_table().columns_by_name[column_name].asc();
        }
      } else {
        throw new Error("You can only order by Columns, OrderByColumns, or 'column_name direction' strings");
      }
    });

    return new Monarch.Model.Relations.Ordering(this, order_by_columns);
  },

  project: function() {
    var projected_columns = Monarch.Util.map(Monarch.Util.to_array(arguments), function(arg) {
      if (arg instanceof Monarch.Model.ProjectedColumn) {
        return arg;
      } else if (arg instanceof Monarch.Model.Column) {
        return new Monarch.Model.ProjectedColumn(arg);
      } else {
        throw new Error("#project takes Columns or ProjectedColumns only");
      }
    });
    return new Monarch.Model.Relations.Projection(this, projected_columns);
  },

  difference: function(right_operand) {
    return new Monarch.Model.Relations.Difference(this, right_operand);
  },

  each: function(fn) {
    Monarch.Util.each(this.records(), fn);
  },

  map: function(fn) {
    return Monarch.Util.map(this.records(), fn);
  },

  empty: function() {
    return this.records().length == 0;
  },

  first: function() {
    return this.records()[0];
  },

  last: function() {
    var records = this.records();
    return records[records.length-1];
  },

  find: function(predicate_or_id) {
    if (typeof predicate_or_id === "string") {
      return this.where(this.column('id').eq(predicate_or_id)).first();
    } else {
      return this.where(predicate_or_id).first();
    }
  },

  size: function() {
    return this.records().length;
  },

  at: function(i) {
    return this.records()[i];
  },
  
  on_insert: function(on_insert_callback) {
    this.subscribe_to_operands_if_needed();
    return this.on_insert_node.subscribe(on_insert_callback);
  },

  on_remove: function(on_remove_callback) {
    this.subscribe_to_operands_if_needed();
    return this.on_remove_node.subscribe(on_remove_callback);
  },

  on_update: function(on_update_callback) {
    this.subscribe_to_operands_if_needed();
    return this.on_update_node.subscribe(on_update_callback);
  },

  has_subscribers: function() {
    return !(this.on_insert_node.empty() && this.on_remove_node.empty() && this.on_update_node.empty());
  },

  fetch: function() {
    return Server.fetch([this]);
  },

  memoize_records: function() {
    this._records = this.records();
  },

  record_inserted: function(record, options) {
    this._records.push(record)
    this.on_insert_node.publish(record);
  },

  record_updated: function(record, update_data) {
    this.on_update_node.publish(record, update_data);
  },

  record_removed: function(record) {
    Monarch.Util.remove(this._records, record);
    this.on_remove_node.publish(record);
  },

  contains: function(record) {
    var records = this.records();
    for(var i = 0; i < records.length; i++) {
      if (records[i] == record) return true;
    }
    return false;
  },

  subscribe_to_operands_if_needed: function() {
    if (this.has_operands && !this.has_subscribers()) {
      this.subscribe_to_operands();
      this.memoize_records();
    }
  },

  unsubscribe_from_operands_when_this_relation_no_longer_has_subscribers: function() {
    var self = this;
    var unsubscribe_callback = function() {
       if (!self.has_subscribers()) self.unsubscribe_from_operands();
    };

    this.on_insert_node.on_unsubscribe(unsubscribe_callback);
    this.on_remove_node.on_unsubscribe(unsubscribe_callback);
    this.on_update_node.on_unsubscribe(unsubscribe_callback);
  },

  unsubscribe_from_operands: function() {
    this.operands_subscription_bundle.destroy_all();
    this._records = null;
  }
});

})(Monarch);
