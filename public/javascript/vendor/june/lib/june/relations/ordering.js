module("June", function(c) { with(c) {
  module("Relations", function() {
    constructor("Ordering", function() {
      include(June.Relations.RelationMethods);

      def('initialize', function(operand, attribute, direction) {
        this.operand = operand;
        this._attribute = attribute;
        this._direction = direction;
        
        this.on_reorder_node = new June.SubscriptionNode();
      });

      def('all', function() {
        return this.operand.all().sort(this.comparator());
      });
      
      def('on_reorder', function(reorder_handler) {
        return this.on_reorder_node.subscribe(reorder_handler);
      });
      
      def('attribute', function(attribute) {
        if (arguments.length == 0) {
          return this._attribute;
        } else {
          if (this._attribute != attribute) {
            this._attribute = attribute;
            this.on_reorder_node.publish(this);
          }
          return this._attribute;
        }
      });

      def('direction', function(direction) {
        if (arguments.length == 0) {
          return this._direction;
        } else {
          if (this._direction != direction) {
            this._direction = direction;
            this.on_reorder_node.publish(this);
          }
          return this._direction;
        }
      });

      def('comparator', function() {
        var self = this;
        return function(a, b) {
          var a_value = a.get_field_value(self._attribute);
          var b_value = b.get_field_value(self._attribute);
          if (a_value == b_value) return 0;
          return self.direction_coefficient() * ((a_value < b_value) ? -1 : 1);
        };
      });

      def('direction_coefficient', function() {
        return (this._direction == "asc") ? 1 : -1;
      });
    });
  });
}});