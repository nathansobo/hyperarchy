(function(Monarch) {

Monarch.constructor("Monarch.Http.DestroyCommand", Monarch.Http.Command, {
  initialize: function(record) {
    this.record = record;
    this.table_name = record.table().global_name;
    this.future = new Monarch.Http.RepositoryUpdateFuture();
    this.command_id = record.id();
  },

  wire_representation: function() {
    return ['destroy', this.table_name, this.command_id];
  },

  complete: function() {
    this.record.local_destroy();
  },

  handle_failure: function() {
    this.future.trigger_on_failure(this.record);
  }
});

})(Monarch);
