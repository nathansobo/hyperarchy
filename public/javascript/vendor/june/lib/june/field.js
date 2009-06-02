module("June", function(c) { with(c) {
  constructor("Field", function() {
    def('initialize', function(tuple, attribute) {
      this.tuple = tuple;
      this.attribute = attribute;
      this.on_update_node = new June.SubscriptionNode();
    });

    def('on_update', function(update_callback) {
      return this.on_update_node.subscribe(update_callback);
    });

    def('set_value', function(value) {
      var old_value = this.value;
      var new_value = this.attribute.convert(value);
      this.value = new_value;
      if (this.tuple.update_notification_enabled) this.on_update_node.publish(new_value, old_value);
      return new_value;
    });

    def('get_value', function(value) {
      return this.value;
    });
  });
}});
