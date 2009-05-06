module("June", function(c) { with(c) {
  module("Subscribable", function() {
    def('initialize_nodes', function(){
      this.on_insert_node = new June.SubscriptionNode();
      this.on_remove_node = new June.SubscriptionNode();
      this.on_update_node = new June.SubscriptionNode();
    });

    def('has_subscribers', function() {
      return !(this.on_insert_node.is_empty() && this.on_remove_node.is_empty() && this.on_update_node.is_empty());
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

    def('has_operands', function(){
      return true;
    });

    def('subscribe_to_operand_if_needed', function() {
      if (this.has_operands() && !this.has_subscribers()) this.subscribe_to_operand();
    });

    def('subscribe_to_operand', function() {
      throw_june_unimplemented('subscribe_to_operand');
    });

  });
}});