(function(Monarch) {

Monarch.constructor("Monarch.Http.UpdateCommand", Monarch.Http.Command, {
  initialize: function(record) {
    this.record = record;
    this.table_name = this.record.table().global_name;
    this.id = this.record.id();
    this.field_values = this.record.local.dirty_wire_representation();
  },

  wire_representation: function() {
    return ['update', this.table_name, this.id, this.field_values];
  },

  complete: function(field_values_from_server, requested_at) {
    this.record.remote.update(field_values_from_server, requested_at);
  },

  handle_failure: function(errors_by_field_name) {
    if (errors_by_field_name) this.record.populate_fields_with_errors(errors_by_field_name);
  }
});

})(Monarch);
