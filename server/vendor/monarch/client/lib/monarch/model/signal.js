constructor("Model.Signal", {
  initialize: function(source, optional_transformer) {
    this.source = source;
    this.transformer = optional_transformer;
    this.on_update_node = new SubscriptionNode();

    var self = this;
    this.source.on_update(function(new_value, old_value) {
      if (self.transformer) {
        new_value = self.transformer(new_value);
        old_value = self.transformer(old_value);
      }
      self.on_update_node.publish(new_value, old_value);
    });
  },

  value: function() {
    var value = this.source.value();
    if (this.transformer) {
      return this.transformer(value);
    } else {
      return value;
    }
  },

  signal: function() {
    return new Model.Signal(this);
  },

  on_update: function(callback) {
    return this.on_update_node.subscribe(callback);
  }
});
