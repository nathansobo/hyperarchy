(function(Monarch) {

Monarch.constructor("Monarch.Http.Command", {
  add_to_request_data: function(request_data) {
    if (!request_data[this.table_name]) request_data[this.table_name] = {};
    request_data[this.table_name][this.command_id] = this.wire_representation();
  },

  complete_and_trigger_before_events: function(field_values_from_server) {
    this.complete(field_values_from_server);
    this.future.trigger_before_events(this.record);
  },

  trigger_after_events: function() {
    this.future.trigger_after_events(this.record);
  }
});

})(Monarch);
