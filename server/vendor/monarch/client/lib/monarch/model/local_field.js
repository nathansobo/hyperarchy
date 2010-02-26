(function(Monarch) {

Monarch.constructor("Monarch.Model.LocalField", Monarch.Model.ConcreteField, {
  initialize: function(fieldset, column) {
    this.fieldset = fieldset;
    this.column = column;
    this.validation_errors = [];
    this.update_events_enabled = true;
  },

  remote_field: function(remote_field) {
    if (arguments.length == 0) {
      return this._remote_field
    } else {
      return this._remote_field = remote_field;
    }
  },

  on_remote_update: function(callback) {
    return this._remote_field.on_update(callback);
  },

  dirty: function() {
    return this._dirty;
  },

  mark_dirty: function() {
    if (!this._dirty) {
      this._dirty = true;
      this.fieldset.field_marked_dirty();
    }
  },

  mark_clean: function() {
    this.clear_validation_errors();
    if (this._dirty) {
      this._dirty = false;
      this.fieldset.field_marked_clean();
    }
  },

  assign_validation_errors: function(errors) {
    this.validation_errors = errors;
  },

  clear_validation_errors: function() {
    var was_invalid = !this.fieldset.valid();
    this.validation_errors = [];
    if (this.fieldset.record.on_valid_node && was_invalid && this.fieldset.valid()) this.fieldset.record.on_valid_node.publish();
  },

  not_modified_after: function(date) {
    return !this.last_modified_at || this.last_modified_at.getTime() <= date.getTime();
  },

  signal: function(optional_transformer) {
    return new Monarch.Model.Signal(this, this.remote_field(), optional_transformer);
  },

  value_wire_representation: function() {
    return this.column.convert_value_for_wire(this.value());
  },

  valid: function() {
    return this.validation_errors.length == 0;
  },

  // private
  
  value_assigned: function(new_value, old_value) {
    if (this.value_equals(this._remote_field.value())) {
      this.mark_clean();
    } else {
      this.mark_dirty();
    }

    if (this.update_events_enabled) {
      var batch_already_in_progress = this.fieldset.batch_in_progress;
      if (!batch_already_in_progress) this.fieldset.begin_batch_update();
      this.fieldset.field_updated(this, new_value, old_value);
      if (this.on_update_node) this.on_update_node.publish(new_value, old_value);
      if (!batch_already_in_progress) this.fieldset.finish_batch_update();
    }
  }
});

})(Monarch);
