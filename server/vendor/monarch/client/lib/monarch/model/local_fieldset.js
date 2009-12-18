(function(Monarch) {

Monarch.constructor("Monarch.Model.LocalFieldset", Monarch.Model.Fieldset, {
  initialize: function(record, remote) {
    this.record = record;
    this.remote = remote;
    remote.local = this;
    this.initialize_fields();
    this.connect_local_and_remote_fields();
  },

  valid: function() {
    return Monarch.Util.all(this.fields_by_column_name, function(column_name, field) {
      return field.valid();
    });
  },

  all_validation_errors: function() {
    var all_validation_errors = [];
    Monarch.Util.each(this.fields_by_column_name, function(column_name, field) {
      all_validation_errors = all_validation_errors.concat(field.validation_errors);
    });
    return all_validation_errors;
  },

  dirty_wire_representation: function() {
    return this.wire_representation(true)
  },

  wire_representation: function(only_dirty) {
    var wire_representation = {};
    Monarch.Util.each(this.fields_by_column_name, function(column_name, field) {
      if (!only_dirty || field.dirty()) wire_representation[column_name] = field.value_wire_representation();
    });
    return wire_representation;
  },

  populate_fields_with_errors: function(errors_by_field_name) {
    Monarch.Util.each(errors_by_field_name, function(field_name, errors) {
      this.field(field_name).validation_errors = errors;
    }.bind(this));
  },

  field_updated: function(field, new_value, old_value) {
    // TODO  
  },

  dirty: function() {
    return Monarch.Util.any(this.fields_by_column_name, function(name, field) {
      return field.dirty();
    });
  },

  // private

  connect_local_and_remote_fields: function() {
    Monarch.Util.each(this.fields_by_column_name, function(column_name, local_field) {
      var remote_field = this.remote.field(column_name);
      local_field.remote_field(remote_field);
      remote_field.local_field(local_field);
    }.bind(this));
  },

  create_new_field: function(column) {
    return new Monarch.Model.LocalField(this, column);
  }
});

})(Monarch);
