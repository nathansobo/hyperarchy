(function(Monarch) {

Monarch.constructor("Monarch.Http.UpdateCommand", {
  initialize: function(record, values_by_method_name) {
    this.record = record;
    this.values_by_method_name = values_by_method_name;
    this.future = new Monarch.Http.RepositoryUpdateFuture();
    this.command_id = record.id();
  },

  add_to_request_data: function(request_data) {
    var table_name = this.record.table().global_name;
    if (!request_data[table_name]) request_data[table_name] = {};

    this.record.start_pending_changes();
    this.record.local_update(this.values_by_method_name);
    this.pending_fieldset = this.record.active_fieldset;
    this.record.restore_primary_fieldset();

    request_data[table_name][this.command_id] = this.pending_fieldset.wire_representation();
  },

  complete_and_trigger_before_events: function(field_values_from_server) {
    this.pending_fieldset.update(field_values_from_server);
    this.pending_fieldset.commit();
    this.future.trigger_before_events(this.record);
  },

  trigger_after_events: function() {
    this.future.trigger_after_events(this.record);
  }
});

})(Monarch);
