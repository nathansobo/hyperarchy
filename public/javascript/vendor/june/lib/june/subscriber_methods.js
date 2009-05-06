module("June", function(c) { with(c) {
  module("SubscriberMethods", function() {
    def("subscribe", function(){
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
      jQuery.each(this.operand_subscriptions, function() {
        this.destroy();
      });
      this.operand_subscriptions = [];
      this._tuples = null;
    });

  });
}});