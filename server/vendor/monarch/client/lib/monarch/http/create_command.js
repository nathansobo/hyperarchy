(function(Monarch) {

_.constructor("Monarch.Http.CreateCommand", Monarch.Http.Command, {
  initialize: function(record) {
    this.record = record;
    this.table = this.record.table;
    this.tableName = this.table.globalName;
    this.fieldValues = record.dirtyWireRepresentation();
  },

  wireRepresentation: function() {
    return ['create', this.tableName, this.fieldValues];
  },

  complete: function(fieldValuesFromServer) {
    this.record.remotelyCreated(fieldValuesFromServer);
  },

  handleFailure: function(errorsByFieldName) {
    if (errorsByFieldName) this.record.assignValidationErrors(errorsByFieldName);
  }
});

})(Monarch);
