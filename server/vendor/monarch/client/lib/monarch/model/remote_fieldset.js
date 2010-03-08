(function(Monarch) {

Monarch.constructor("Monarch.Model.RemoteFieldset", Monarch.Model.Fieldset, {
  initialize: function(record) {
    this.record = record;
    this.local = null;
    this.initializeFields();
    this.batchUpdateInProgress = false;
  },

  update: function(fieldValues) {
    this.batchedUpdates = {};

    _.each(fieldValues, function(fieldValue, columnName) {
      var field = this.field(columnName);
      if (field) field.value(fieldValue);
    }.bind(this));

    var changeset = this.batchedUpdates;
    this.batchedUpdates = null;
    if (this.updateEventsEnabled && Monarch.Util.keys(changeset).length > 0) {
      if (this.record.onRemoteUpdateNode) this.record.onRemoteUpdateNode.publish(changeset);
      this.record.table.tupleUpdatedRemotely(this.record, changeset);
    }
  },

  fieldUpdated: function(field, newValue, oldValue) {
    var changeData = {};
    changeData[field.column.name] = {
      column: field.column,
      oldValue: oldValue,
      newValue: newValue
    };

    Monarch.Util.extend(this.batchedUpdates, changeData);
  },

  // private

  createNewField: function(column) {
    return new Monarch.Model.RemoteField(this, column);
  }
});

})(Monarch);
