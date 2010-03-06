(function(Monarch) {

Monarch.constructor("Monarch.Model.Fieldset", {
  field: function(columnOrName) {
    var columnName = (typeof columnOrName == 'string') ? columnOrName : columnOrName.name;
    return this.fieldsByColumnName[columnName] || this.syntheticFieldsByColumnName[columnName];
  },

  // protected

  initializeSyntheticFields: function() {
    var self = this;
    this.syntheticFieldsByColumnName = {};
    Monarch.Util.each(this.record.table.syntheticColumnsByName, function(columnName, column) {
      var signal = column.definition.call(self.record);
      self.syntheticFieldsByColumnName[columnName] = new Monarch.Model.SyntheticField(self, column, signal);
      self[columnName] = function() {
        var field = self.field(columnName);
        return field.value.apply(field, arguments);
      }
    });
  },

  initializeFields: function() {
    var self = this;
    this.fieldsByColumnName = {};
    Monarch.Util.each(this.record.table.columnsByName, function(columnName, column) {
      this.fieldsByColumnName[columnName] = this.createNewField(column);
      this[columnName] = function() {
        var field = this.field(columnName);
        return field.value.apply(field, arguments);
      }
    }.bind(this));
  }
});

})(Monarch);
