(function(Monarch) {

Monarch.constructor("Monarch.Http.DestroyCommand", Monarch.Http.Command, {
  initialize: function(record) {
    this.record = record;
    this.tableName = record.table.globalName;
    this.id = record.id();
  },

  wireRepresentation: function() {
    return ['destroy', this.tableName, this.id];
  },

  complete: function() {
    this.record.remotelyDestroyed();
  },

  handleFailure: function() {
  }
});

})(Monarch);
