(function(Monarch) {

Monarch.constructor("Monarch.Http.UpdateCommand", Monarch.Http.Command, {
  initialize: function(record) {
    this.record = record;
    this.table_name = this.record.table.global_name;
    this.id = this.record.id();
    this.field_values = this.record.local.dirty_wire_representation();
  },

  wire_representation: function() {
    return ['update', this.table_name, this.id, this.field_values];
  },

  complete: function(field_values_from_server) {
    this.record.remotely_updated(field_values_from_server);
  },

  handle_failure: function(errors_by_field_name) {
    if (errors_by_field_name) this.record.assign_validation_errors(errors_by_field_name);
  }
});

})(Monarch);
