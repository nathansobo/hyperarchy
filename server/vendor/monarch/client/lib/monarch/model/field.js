(function(Monarch) {

Monarch.constructor("Monarch.Model.Field", {
  signal: function(optional_transformer) {
    return new Monarch.Model.Signal(this, optional_transformer);
  },

  on_update: function(update_callback) {
    this.on_update_node.subscribe(update_callback);
  }
});

})(Monarch);
