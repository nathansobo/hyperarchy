(function(Monarch) {

Monarch.constructor("Monarch.Model.Relations.Relation", {
  has_operands: true,
  __relation__: true,

  initialize_events_system: function() {
    this.on_insert_node = new Monarch.SubscriptionNode();
    this.on_remove_node = new Monarch.SubscriptionNode();
    this.on_update_node = new Monarch.SubscriptionNode();
    if (this.has_operands) {
      this.operands_subscription_bundle = new Monarch.SubscriptionBundle();
      this.unsubscribe_from_operands_when_this_relation_no_longer_has_subscribers();
    }
  },

  where: function(predicate_or_conditions_hash) {
    var predicate;

    if (predicate_or_conditions_hash.constructor.is_predicate) {
      predicate = predicate_or_conditions_hash;
    } else {
      predicate = this.predicate_from_hash(predicate_or_conditions_hash);
    }
    return new Monarch.Model.Relations.Selection(this, predicate);

  },

  project: function() {
    if (arguments.length == 1) {
      var table;
      if (_.isFunction(arguments[0])) {
        table = arguments[0].table;
      } else if (arguments[0] instanceof Monarch.Model.Relations.Table) {
        table = arguments[0];
      }

      if (table) return new Monarch.Model.Relations.TableProjection(this, table);
    }

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

  join: function(right_operand) {
    if (typeof right_operand === 'function') right_operand = right_operand.table;
    var left_operand = this;
    return {
      on: function(predicate) {
        return new Monarch.Model.Relations.InnerJoin(left_operand, right_operand, predicate);
      }
    };
  },

  join_to: function(right_operand) {
    if (typeof right_operand === 'function') right_operand = right_operand.table;
    var left_surface_tables = this.surface_tables();
    var right_surface_tables = right_operand.surface_tables();
    var join_columns = this.find_join_columns(_.last(left_surface_tables), _.first(right_surface_tables));
    return this.join(right_operand).on(join_columns[0].eq(join_columns[1]));
  },

  join_through: function(right_operand) {
    if (typeof right_operand === 'function') right_operand = right_operand.table;
    return this.join_to(right_operand).project(right_operand);
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
          return self.column(column_name).desc();
        } else {
          return self.column(column_name).asc();
        }
      } else {
        throw new Error("You can only order by Columns, OrderByColumns, or 'column_name direction' strings");
      }
    });

    return new Monarch.Model.Relations.Ordering(this, order_by_columns);
  },

  difference: function(right_operand) {
    return new Monarch.Model.Relations.Difference(this, right_operand);
  },

  tuples: function() {
    return this.local_tuples();
  },

  local_tuples: function() {
    return Monarch.Util.select(this.all_tuples(), function(record) {
      return !record.locally_destroyed;
    });
  },

  dirty_tuples: function() {
    return Monarch.Util.select(this.all_tuples(), function(record) {
      return record.dirty();
    });
  },

  each: function(fn) {
    Monarch.Util.each(this.tuples(), fn);
  },

  map: function(fn) {
    return Monarch.Util.map(this.tuples(), fn);
  },

  any: function(fn) {
    return Monarch.Util.any(this.tuples(), fn);
  },

  empty: function() {
    return this.tuples().length == 0;
  },

  first: function() {
    return this.tuples()[0];
  },

  last: function() {
    var tuples = this.tuples();
    return tuples[tuples.length-1];
  },

  find: function(predicate_or_id_or_hash) {
    if (typeof predicate_or_id_or_hash === "string") {
      return this.where(this.column('id').eq(predicate_or_id_or_hash)).first();
    } else {
      return this.where(predicate_or_id_or_hash).first();
    }
  },

  size: function() {
    return this.tuples().length;
  },

  at: function(i) {
    return this.tuples()[i];
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

  subscribe: function() {
    return Server.subscribe([this]);
  },

  memoize_tuples: function() {
    this._tuples = this.tuples();
  },

  tuple_inserted: function(record, options) {
    if (!this.contains(record)) {
      this._tuples.push(record)
    }
    this.on_insert_node.publish(record);
  },

  tuple_updated: function(record, update_data) {
    this.on_update_node.publish(record, update_data);
  },

  tuple_removed: function(record) {
    Monarch.Util.remove(this._tuples, record);
    this.on_remove_node.publish(record);
  },

  contains: function(record) {
    var tuples = this.tuples();
    for(var i = 0; i < tuples.length; i++) {
      if (tuples[i] == record) return true;
    }
    return false;
  },

  subscribe_to_operands_if_needed: function() {
    if (this.has_operands && !this.has_subscribers()) {
      this.subscribe_to_operands();
      this.memoize_tuples();
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
    this._tuples = null;
  },

  // private

  predicate_from_hash: function(hash) {
    var self = this;
    var predicates = [];
    Monarch.Util.each(hash, function(key, value) {
      predicates.push(self.column(key).eq(value))
    });

    if (_.isEmpty(predicates)) throw new Error("No key value pairs provided for predication");

    if (predicates.length == 1) {
      return predicates[0];
    } else {
      return new Monarch.Model.Predicates.And(predicates);
    }
  },

  find_join_columns: function(left, right) {
    var foreign_key;
    if (foreign_key = right.column(Monarch.Inflection.singularize(left.global_name) + "_id")) {
      return [left.column("id"), foreign_key];
    } else if (foreign_key = left.column(Monarch.Inflection.singularize(right.global_name) + "_id")) {
      return [foreign_key, right.column("id")];
    } else {
      throw new Error("No foreign key found for #join_to operation");
    }
  }

});

})(Monarch);
