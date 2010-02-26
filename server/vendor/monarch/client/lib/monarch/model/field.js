(function(Monarch) {

Monarch.constructor("Monarch.Model.Field", {
  on_update: function(update_callback) {
    if (!this.on_update_node) this.on_update_node = new Monarch.SubscriptionNode();
    return this.on_update_node.subscribe(update_callback);
  }
});

})(Monarch);
