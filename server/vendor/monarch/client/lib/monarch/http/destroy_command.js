(function(Monarch) {

Monarch.constructor("Monarch.Http.DestroyCommand", Monarch.Http.Command, {
  initialize: function(record) {
    this.record = record;
    this.table_name = record.table().global_name;
    this.id = record.id();
  },

  wire_representation: function() {
    return ['destroy', this.table_name, this.id];
  },

  complete: function() {
    this.record.finalize_local_destroy();
  },

  handle_failure: function() {
  }
});

})(Monarch);
