constructor("Model.Field", {
  initialize: function(record, column) {
    this.record = record;
    this.column = column;
  },

  value: function(value) {
    if (value) {
      if (this._value != value) {
        var old_value = this._value;
        this._value = value;
        this.notify_record_of_update(old_value, value);
      }
      return value;
    } else {
      return this._value;
    }
  },

  notify_record_of_update: function(old_value, new_value) {
    if (!this.record.update_events_enabled) return;

    var update_data = {};
    update_data[this.column.name] = {
      column: this.column,
      old_value: old_value,
      new_value: new_value
    };

    if (this.record.batched_updates) {
      jQuery.extend(this.record.batched_updates, update_data);
    } else {
      this.record.table().record_updated(this.record, update_data)
    }
  }
});
