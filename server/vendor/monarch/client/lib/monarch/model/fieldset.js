(function(Monarch) {

Monarch.constructor("Monarch.Model.Fieldset", {
  field: function(columnOrName) {
    var columnName;
    if (typeof columnOrName == 'string') {
      columnName =  columnOrName;
    } else {
      if (columnOrName.table.globalName !== this.record.table.globalName) return null;
      columnName = columnOrName.name;
    }
    return this.fieldsByColumnName[columnName] || this.syntheticFieldsByColumnName[columnName];
  },

  // protected

  initializeSyntheticFields: function() {
    this.syntheticFieldsByColumnName = {};
    _.each(this.record.table.syntheticColumnsByName, function(column, columnName) {
      var signal = column.definition.call(this.record);
      this.syntheticFieldsByColumnName[columnName] = new Monarch.Model.SyntheticField(this, column, signal);
      this[columnName] = function() {
        var field = this.field(columnName);
        return field.value.apply(field, arguments);
      }
    }, this);
  },

  initializeFields: function() {
    this.fieldsByColumnName = {};
    _.each(this.record.table.columnsByName, function(column, columnName) {
      this.fieldsByColumnName[columnName] = this.createNewField(column);
      this[columnName] = function() {
        var field = this.field(columnName);
        return field.value.apply(field, arguments);
      }
    }, this);
  }
});

})(Monarch);
