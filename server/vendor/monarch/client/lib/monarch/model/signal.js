(function(Monarch) {

Monarch.constructor("Monarch.Model.Signal", {
  initialize: function(local_field, remote_field, optional_transformer) {
    this.local_field = local_field;
    this.remote_field = remote_field;
    this.transformer = optional_transformer;

    this.on_local_update_node = new Monarch.SubscriptionNode();
    this.on_remote_update_node = new Monarch.SubscriptionNode();

    this.local_field.on_update(function(new_value, old_value) {
      if (this.transformer) {
        new_value = this.transformer(new_value);
        old_value = this.transformer(old_value);
      }
      this.on_local_update_node.publish(new_value, old_value);
    }.bind(this));

    this.remote_field.on_update(function(new_value, old_value) {
      if (this.transformer) {
        new_value = this.transformer(new_value);
        old_value = this.transformer(old_value);
      }
      this.on_remote_update_node.publish(new_value, old_value);
    }.bind(this));
  },

  local_value: function() {
    var value = this.local_field.value();
    if (this.transformer) {
      return this.transformer(value);
    } else {
      return value;
    }
  },

  remote_value: function() {
    var value = this.remote_field.value();
    if (this.transformer) {
      return this.transformer(value);
    } else {
      return value;
    }
  },

  on_local_update: function(callback) {
    return this.on_local_update_node.subscribe(callback);
  },

  on_remote_update: function(callback) {
    return this.on_remote_update_node.subscribe(callback);
  },

  combine: function(other_signal, transformer) {
    return new Monarch.Model.CombinedSignal(this, other_signal, transformer);
  }
});

})(Monarch);
