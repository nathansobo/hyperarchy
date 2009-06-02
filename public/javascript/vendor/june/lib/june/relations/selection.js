module("June", function(c) { with(c) {
  module("Relations", function() {
    constructor("Selection", function() {
      include(June.Relations.RelationMethods);

      def('initialize', function(operand, predicate) {
        this.operand = operand;
        this.predicate = predicate;
        this.initialize_nodes();
      });

      def('all', function() {
        if (this._tuples) return this._tuples;

        var predicate = this.predicate;
        var all = [];
        this.operand.each(function() {
          if (predicate.evaluate(this)) all.push(this);
        });
        return all;
      });

      def("wire_representation", function() {
        return {
          type: "selection",
          operand: this.operand.wire_representation(),
          predicate: this.predicate.wire_representation()
        };
      });

      def('subscribe_to_operand', function() {
        this.memoize_tuples();

        var self = this;
        this.operand_subscription_bundle.add(this.operand.on_insert(function(tuple) {
          if (self.predicate.evaluate(tuple)) self.tuple_inserted(tuple);
        }));

        this.operand_subscription_bundle.add(this.operand.on_remove(function(tuple) {
          if (self.predicate.evaluate(tuple)) self.tuple_removed(tuple);
        }));

        this.operand_subscription_bundle.add(this.operand.on_update(function(tuple, changed_attributes) {
          if (self.contains(tuple)) {
            if (self.predicate.evaluate(tuple)) {
              self.tuple_updated(tuple, changed_attributes);
            } else {
              self.tuple_removed(tuple);
            }
          } else {
            if (self.predicate.evaluate(tuple)) self.tuple_inserted(tuple);
          }
        }));
      });
    });
  });
}});