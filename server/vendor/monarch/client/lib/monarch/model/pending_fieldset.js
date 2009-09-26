constructor("Model.PendingFieldset", Model.Fieldset, {
  initialize: function(primary_fieldset) {
    this.record = primary_fieldset.record;
    this.fields_by_column_name = {};
    for (var column_name in primary_fieldset.fields_by_column_name) {
      var pending_field = primary_fieldset.fields_by_column_name[column_name].clone_pending_field(this);
      this.fields_by_column_name[column_name] = pending_field;
    }
  },

  wire_representation: function() {
    var wire_representation = {};
    Util.each(this.fields_by_column_name, function(column_name, field) {
      if (field.dirty) wire_representation[column_name] = field.value_wire_representation();
    });
    return wire_representation;
  },

  update: function(field_values_by_column_name) {
    var self = this;
    Util.each(field_values_by_column_name, function(column_name, field_value) {
      self.field(column_name).value(field_value);
    });
  },

  commit: function(options) {
    this.record.local_update(this.wire_representation(), options);
  }
});
