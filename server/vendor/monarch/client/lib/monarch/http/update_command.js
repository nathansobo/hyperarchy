(function(Monarch) {

_.constructor("Monarch.Http.UpdateCommand", Monarch.Http.Command, {
  initialize: function(record) {
    this.record = record;
    this.version = this.record.nextPendingVersion();
    this.tableName = this.record.table.globalName;
    this.id = this.record.id();
    this.fieldValues = this.record.local.dirtyWireRepresentation();
  },

  wireRepresentation: function() {
    return ['update', this.tableName, this.id, this.fieldValues];
  },

  complete: function(fieldValuesFromServer) {
    this.record.remotelyUpdated(fieldValuesFromServer, this.version);
  },

  handleFailure: function(errorsByFieldName) {
    if (errorsByFieldName) this.record.assignValidationErrors(errorsByFieldName);
  }
});

})(Monarch);
