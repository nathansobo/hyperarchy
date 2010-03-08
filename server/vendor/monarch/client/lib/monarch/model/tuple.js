(function(Monarch) {

Monarch.constructor("Monarch.Model.Tuple", {
  constructorProperties: {
    initializeFieldReaders: function() {
      var self = this;
      _.each(this.projectedColumnsByName, function(projectedColumn, name) {
        self.prototype[name] = function() {
          return this.field(projectedColumn).value();
        };
      });
    }
  },

  initialize: function(operandRecord) {
    this.operandRecord = operandRecord;
  },

  field: function(projectedColumnOrName) {
    var projectedColumn;
    if (typeof projectedColumnOrName == "string") {
      projectedColumn = this.constructor.projectedColumnsByName[projectedColumnOrName];
    } else {
      projectedColumn = projectedColumnOrName;
    }

    return this.operandRecord.field(projectedColumn.column);
  },

  evaluate: function(columnOrConstant) {
    if (columnOrConstant instanceof Monarch.Model.ProjectedColumn) {
      return this.field(columnOrConstant).value();
    } else {
      return columnOrConstant;
    }
  },

  hashCode: function() {
    var digestInput = [];
    _.each(_(this.constructor.projectedColumnsByName).keys().sort(), function(key) {
      digestInput.push(key, this.field(key).valueWireRepresentation());
    }, this);
    return b64_md5(digestInput.join(""));
  }
});

})(Monarch);
