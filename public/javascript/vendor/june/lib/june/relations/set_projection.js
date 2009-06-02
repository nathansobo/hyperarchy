module("June", function(c) { with(c) {
  module("Relations", function() {
    constructor("SetProjection", function() {
      include(June.Relations.RelationMethods);

      def('initialize', function(operand, projected_set) {
        this.operand = operand;
        this.projected_set = projected_set;
        this.initialize_nodes();
      });

      def('all', function() {
        if (this._tuples) return this._tuples;
        var projected_set = this.projected_set;
        return this.operand.map(function() {
          return this.tuple_for_set(projected_set);
        });
      });

      def("wire_representation", function() {
        return {
          type: "set_projection",
          projected_set: this.projected_set.global_name,
          operand: this.operand.wire_representation()
        };
      });

      def('subscribe_to_operand', function() {
        this.memoize_tuples();

        var self = this;
        this.operand_subscription_bundle.add(this.operand.on_insert(function(composite_tuple) {
          var projected_tuple = composite_tuple.tuple_for_set(self.projected_set);
          if (!self.contains(projected_tuple)) self.tuple_inserted(projected_tuple);
        }));

        this.operand_subscription_bundle.add(this.operand.on_remove(function(composite_tuple) {
          var projected_tuple = composite_tuple.tuple_for_set(self.projected_set);
          var operand_contains_another_instance_of_projected_tuple = (self.operand.find(self.projected_set.id.eq(projected_tuple.id())) != null);
          if (!operand_contains_another_instance_of_projected_tuple) self.tuple_removed(projected_tuple);
        }));

        this.operand_subscription_bundle.add(this.operand.on_update(function(composite_tuple, changed_attributes) {
          var updated_attribute_was_in_projected_set = false
          for (var attribute_name in changed_attributes) {
            if (changed_attributes[attribute_name].attribute.set == self.projected_set) updated_attribute_was_in_projected_set = true;
          }
          if (updated_attribute_was_in_projected_set) self.tuple_updated(composite_tuple.tuple_for_set(self.projected_set));
        }));
      });
    });
  });
}});
