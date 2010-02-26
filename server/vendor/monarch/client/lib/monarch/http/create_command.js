(function(Monarch) {

Monarch.constructor("Monarch.Http.CreateCommand", Monarch.Http.Command, {
  initialize: function(record) {
    this.record = record;
    this.table = this.record.table;
    this.table_name = this.table.global_name;
    this.field_values = record.dirty_wire_representation();
  },

  wire_representation: function() {
    return ['create', this.table_name, this.field_values];
  },

  complete: function(field_values_from_server) {
    this.record.remotely_created(field_values_from_server);
  },

  handle_failure: function(errors_by_field_name) {
    if (errors_by_field_name) this.record.assign_validation_errors(errors_by_field_name);
  }
});

})(Monarch);
