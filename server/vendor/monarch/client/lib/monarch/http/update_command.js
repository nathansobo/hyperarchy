(function(Monarch) {

Monarch.constructor("Monarch.Http.UpdateCommand", Monarch.Http.Command, {
  initialize: function(record, values_by_method_name) {
    this.record = record;
    this.table_name = this.record.table().global_name;
    this.command_id = record.id();
    this.values_by_method_name = values_by_method_name;
    this.future = new Monarch.Http.RepositoryUpdateFuture();
    this.record.start_pending_changes();
    this.record.local_update(this.values_by_method_name);
    this.pending_fieldset = this.record.active_fieldset;
    this.record.restore_primary_fieldset();
  },

  wire_representation: function() {
    return ['update', this.table_name, this.command_id, this.pending_fieldset.wire_representation()];
  },

  complete: function(field_values_from_server) {
    this.pending_fieldset.update(field_values_from_server);
    this.pending_fieldset.commit();
  },

  handle_failure: function(errors_by_field_name) {
    this.record.use_pending_fieldset(this.pending_fieldset);
    if (errors_by_field_name) this.record.populate_fields_with_errors(errors_by_field_name);
    this.future.trigger_on_failure(this.record);
    this.record.restore_primary_fieldset();
  }
});

})(Monarch);
