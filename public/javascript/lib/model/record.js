constructor("Model.Record", {
  eigenprops: {
    extended: function(subconstructor) {
      subconstructor.table = new Model.Relations.Table(this.determine_global_name(subconstructor));
      subconstructor.column("id", "string");
    },

    column: function(name, type) {
      this[name] = this.table.define_column(name, type);
      this.prototype[name] = function(value) {
        var field = this.fields_by_column_name[name];
        if (value) {
          return field.value(value);
        } else {
          return field.value();
        }
      };
    },

    columns: function(column_name_type_pairs) {
      for (var name in column_name_type_pairs) {
        this.column(name, column_name_type_pairs[name]);
      }
    },

    determine_global_name: function(record_constructor) {
      return Inflection.pluralize(Inflection.underscore(record_constructor.basename));
    },

    create: function(field_values) {
      var self = this;
      var future = new AjaxFuture();
      Model.Repository.remote_create(this.table, field_values)
        .on_success(function(returned_field_values) {
          future.trigger_success(self.local_create(returned_field_values));
        });
      return future;
    },

    local_create: function(field_values) {
      var record = new this(field_values);
      this.table.insert(record);
      return record;
    }
  },

  initialize: function(field_values_by_column_name) {
    this.initialize_fields_by_column_name();
    if (field_values_by_column_name) this.assign_field_values(field_values_by_column_name);
  },

  initialize_fields_by_column_name: function() {
    this.fields_by_column_name = {};
    for (var attr_name in this.constructor.table.columns_by_name) {
      var column = this.constructor.table.columns_by_name[attr_name];
      this.fields_by_column_name[attr_name] = new Model.Field(this, column);
    }
  },

  assign_field_values: function(field_values_by_column_name) {
    for (var attr_name in field_values_by_column_name) {
      this.fields_by_column_name[attr_name].value(field_values_by_column_name[attr_name])
    }
  }
});