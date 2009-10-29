(function(Monarch) {

Monarch.constructor("Monarch.Http.DestroyCommand", {
  initialize: function(record) {
    this.record = record;
    this.future = new Monarch.Http.RepositoryUpdateFuture();
    this.command_id = record.id();
  },

  add_to_request_data: function(request_data) {
    var table_name = this.record.table().global_name;
    if (!request_data[table_name]) request_data[table_name] = {};
    request_data[table_name][this.command_id] = null;
  },

  complete_and_trigger_before_events: function(field_values_from_server) {
    this.record.local_destroy();
    this.future.trigger_before_events(this.record);
  },

  trigger_after_events: function() {
    this.future.trigger_after_events(this.record);
  }
});

})(Monarch);
