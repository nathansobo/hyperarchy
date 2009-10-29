(function(Monarch) {

Monarch.constructor("Monarch.Http.CreateCommand", {
  initialize: function(table, field_values, command_id) {
    this.table = table;
    this.field_values = field_values;
    this.command_id = command_id;
    this.future = new Monarch.Http.RepositoryUpdateFuture();
  },

  add_to_request_data: function(request_data) {
    var table_name = this.table.global_name;
    if (!request_data[table_name]) request_data[table_name] = {};
    
    this.pending_record = new this.table.record_constructor(this.field_values);
    request_data[table_name][this.command_id] = this.pending_record.wire_representation();
  },

  complete_and_trigger_before_events: function(field_values_from_server) {
    this.pending_record.local_update(field_values_from_server);
    this.table.insert(this.pending_record);
    this.future.trigger_before_events(this.pending_record);
  },

  trigger_after_events: function() {
    this.future.trigger_after_events(this.pending_record);
  }
});

})(Monarch);
