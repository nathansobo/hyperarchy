module("June", function(c) { with(c) {
  module("Relations", function() {
    module("RelationMethods", function() {
      def('where', function(predicate) {
        return new June.Relations.Selection(this, predicate);
      });

      def('join', function(right_operand) {
        var left_operand = this;
        return {
          on: function(predicate) {
            return new June.Relations.InnerJoin(left_operand, right_operand, predicate);
          }
        }
      });

      def('project', function(projected_set) {
        return new June.Relations.SetProjection(this, projected_set);
      });

      def('order_by', function(attribute, direction) {
        return new June.Relations.Ordering(this, attribute, direction || 'asc');
      });

      // TODO: BR/NS - calling find with an id argument will only work on set because we have no general way of resolving attributes on relations
      def('find', function(id_or_predicate) {
        var predicate;
        if (id_or_predicate.evaluate) {
          predicate = id_or_predicate;
        } else {
          predicate = this.id.eq(id_or_predicate);
        }
        return this.where(predicate).first();
      });

      def('first', function() {
        return this.all()[0];
      });
      
      def('map', function(fn) {
        return June.map(this.all(), fn);
      });
      
      def('each', function(fn) {
        June.each(this.all(), fn);
      });
      
      def('pull', function(pull_callback) {
        June.pull([this], pull_callback);
      });

      def('memoize_tuples', function() {
        this._tuples = this.all();
      });

      def('contains', function(tuple) {
        return this.all().indexOf(tuple) != -1;
      });

      def('tuple_inserted', function(tuple) {
        this._tuples.push(tuple);
        this.on_insert_node.publish(tuple);
      });

      def('tuple_removed', function(tuple) {
        June.remove(this._tuples, tuple);
        this.on_remove_node.publish(tuple);
      });

      def('tuple_updated', function(tuple, updated_attributes) {
        this.on_update_node.publish(tuple, updated_attributes);
      });

      def('initialize_nodes', function(){
        this.on_insert_node = new June.SubscriptionNode();
        this.on_remove_node = new June.SubscriptionNode();
        this.on_update_node = new June.SubscriptionNode();
        if (this.has_operands()) {
          this.operand_subscription_bundle = new June.SubscriptionBundle();
          this.register_on_unsubscribe_handlers_on_nodes();
        }
      });

      def('on_insert', function(on_insert_handler) {
        this.subscribe_to_operand_if_needed();
        return this.on_insert_node.subscribe(on_insert_handler);
      });

      def('on_remove', function(on_remove_handler) {
        this.subscribe_to_operand_if_needed();
        return this.on_remove_node.subscribe(on_remove_handler);
      });

      def('on_update', function(on_update_handler) {
        if (this.has_operands()) this.subscribe_to_operand_if_needed();
        return this.on_update_node.subscribe(on_update_handler);
      });

      def('subscribe_to_operand_if_needed', function() {
        if (this.has_operands() && !this.has_subscribers()) this.subscribe_to_operand();
      });

      def('has_operands', function(){
        return true;
      });

      def('has_subscribers', function() {
        return !(this.on_insert_node.is_empty() && this.on_remove_node.is_empty() && this.on_update_node.is_empty());
      });

      def("register_on_unsubscribe_handlers_on_nodes", function(){
        var self = this;
        this.on_insert_node.on_unsubscribe(function() {
          self.unsubscribe_from_operands_if_no_longer_needed();
        });
        this.on_remove_node.on_unsubscribe(function() {
          self.unsubscribe_from_operands_if_no_longer_needed();
        });
        this.on_update_node.on_unsubscribe(function() {
          self.unsubscribe_from_operands_if_no_longer_needed();
        });
      });

      def('unsubscribe_from_operands_if_no_longer_needed', function() {
        if (!this.has_subscribers()) {
          this.unsubscribe_from_operands();
        }
      });

      def('unsubscribe_from_operands', function() {
        this.operand_subscription_bundle.destroy_all();
        this._tuples = null;
      });
    });
  });
}});