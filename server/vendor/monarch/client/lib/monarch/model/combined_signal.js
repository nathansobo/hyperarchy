(function(Monarch) {

Monarch.constructor("Monarch.Model.CombinedSignal", {
  initialize: function(left_operand, right_operand, transformer) {
    var self = this;

    this.left_operand = left_operand;
    this.right_operand = right_operand;
    this.transformer = transformer;
    this.on_remote_update_node = new Monarch.SubscriptionNode();
    this.on_local_update_node = new Monarch.SubscriptionNode();

    this.left_operand.on_remote_update(function(new_value, old_value) {
      var old_value = self.transformer(old_value, self.right_operand.remote_value());
      var new_value = self.transformer(new_value, self.right_operand.remote_value());
      if (new_value !== old_value) self.on_remote_update_node.publish(new_value, old_value);
    });

    this.right_operand.on_remote_update(function(new_value, old_value) {
      var old_value = self.transformer(self.left_operand.remote_value(), old_value);
      var new_value = self.transformer(self.left_operand.remote_value(), new_value);
      if (new_value !== old_value) self.on_remote_update_node.publish(new_value, old_value);
    });

    this.left_operand.on_local_update(function(new_value, old_value) {
      var old_value = self.transformer(old_value, self.right_operand.remote_value());
      var new_value = self.transformer(new_value, self.right_operand.remote_value());
      if (new_value !== old_value) self.on_local_update_node.publish(new_value, old_value);
    });

    this.right_operand.on_local_update(function(new_value, old_value) {
      var old_value = self.transformer(self.left_operand.remote_value(), old_value);
      var new_value = self.transformer(self.left_operand.remote_value(), new_value);
      if (new_value !== old_value) self.on_local_update_node.publish(new_value, old_value);
    });
  },

  local_value: function() {
    return this.transformer(this.left_operand.local_value(), this.right_operand.local_value());
  },

  remote_value: function() {
    return this.transformer(this.left_operand.remote_value(), this.right_operand.remote_value());
  },

  on_remote_update: function(callback) {
    return this.on_remote_update_node.subscribe(callback);
  },

  on_local_update: function(callback) {
    return this.on_local_update_node.subscribe(callback);
  }
});

})(Monarch);
