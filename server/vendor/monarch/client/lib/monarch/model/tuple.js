(function(Monarch) {

Monarch.constructor("Monarch.Model.Tuple", {
  constructor_properties: {
    initialize_field_readers: function() {
      var self = this;
      Monarch.Util.each(this.projected_columns_by_name, function(name, projected_column) {
        self.prototype[name] = function() {
          return this.field(projected_column).value();
        };
      });
    }
  },

  initialize: function(operand_record) {
    this.operand_record = operand_record;
  },

  field: function(projected_column_or_name) {
    var projected_column;
    if (typeof projected_column_or_name == "string") {
      projected_column = this.constructor.projected_columns_by_name[projected_column_or_name];
    } else {
      projected_column = projected_column_or_name;
    }

    return this.operand_record.field(projected_column.column);
  },

  evaluate: function(column_or_constant) {
    if (column_or_constant instanceof Monarch.Model.ProjectedColumn) {
      return this.field(column_or_constant).value();
    } else {
      return column_or_constant;
    }
  },

  hash_code: function() {
    var digest_input = [];
    _.each(_(this.constructor.projected_columns_by_name).keys().sort(), function(key) {
      digest_input.push(key, this.field(key).value_wire_representation());
    }, this);
    return b64_md5(digest_input.join(""));
  }
});

})(Monarch);
