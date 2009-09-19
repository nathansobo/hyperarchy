constructor("Model.Record", {
  constructor_properties: {
    extended: function(subconstructor) {
      subconstructor.table = new Model.Relations.Table(this.determine_global_name(subconstructor), subconstructor);
      subconstructor.column("id", "string");
      subconstructor.relation_definitions = [];
      Repository.register_table(subconstructor.table);
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

    relates_to_many: function(name, definition) {
      this.relation_definitions.push({ name: name, definition: definition });
      this.prototype[name] = function() {
        return this.relations_by_name[name];
      };
    },

    has_many: function(target_table_name) {
      var foreign_key_column_name = Inflection.singularize(this.table.global_name) + "_id";
      this.relates_to_many(target_table_name, function() {
        var target_table = Repository.tables[target_table_name];
        var foreign_key_column = target_table.columns_by_name[foreign_key_column_name];
        return target_table.where(foreign_key_column.eq(this.id()));
      });
    },

    determine_global_name: function(record_constructor) {
      return Inflection.pluralize(Inflection.underscore(record_constructor.basename));
    },

    create: function(field_values) {
      var self = this;
      var future = new AjaxFuture();
      Repository.remote_create(this.table, field_values)
        .on_success(function(returned_field_values) {
          future.trigger_success(self.local_create(returned_field_values));
        });
      return future;
    },

    local_create: function(field_values) {
      var record = new this(field_values);
      this.table.insert(record);
      return record;
    },

    // delegate to table
    find: function(id) {
      return this.table.find(id);
    },

    fetch: function() {
      return this.table.fetch();
    },

    all: function() {
      return this.table.all();
    },

    each: function(fn) {
      this.table.each(fn);
    },

    on_insert: function(callback) {
      return this.table.on_insert(callback);
    },

    on_update: function(callback) {
      return this.table.on_update(callback);
    },

    on_remove: function(callback) {
      return this.table.on_remove(callback);
    },

    where: function(predicate) {
      return this.table.where(predicate);
    },

    is_empty: function() {
      return this.table.is_empty();
    }
  },

  initialize: function(field_values_by_column_name) {
    this.initialize_fields_by_column_name();
    if (field_values_by_column_name) {
      this.update_events_enabled = false;
      this.update(field_values_by_column_name);
    }
    this.update_events_enabled = true;

    this.initialize_relations();
  },

  initialize_fields_by_column_name: function() {
    this.fields_by_column_name = {};
    for (var attr_name in this.constructor.table.columns_by_name) {
      var column = this.constructor.table.columns_by_name[attr_name];
      this.fields_by_column_name[attr_name] = new Model.Field(this, column);
    }
  },

  initialize_relations: function() {
    var self = this;
    this.relations_by_name = {};
    Util.each(this.constructor.relation_definitions, function(relation_definition) {
      self.relations_by_name[relation_definition.name] = relation_definition.definition.call(self);
    });
  },

  destroy: function() {
    this.table().remove(this);
  },

  update: function(field_values_by_column_name) {
    if (this.update_events_enabled) this.batched_updates = {};
    for (var attr_name in field_values_by_column_name) {
      this.fields_by_column_name[attr_name].value(field_values_by_column_name[attr_name])
    }
    if (this.update_events_enabled) {
      var batched_updates = this.batched_updates;
      this.batched_updates = null;
      this.table().record_updated(this, batched_updates);
    }
  },

  table: function() {
    return this.constructor.table;
  },

  wire_representation: function() {
    var wire_representation = {};
    Util.each(this.fields_by_column_name, function(column_name, field) {
      wire_representation[column_name] = field.value();
    });
    return wire_representation;
  },

  field: function(column) {
    return this.fields_by_column_name[column.name];
  },

  evaluate: function(column_or_constant) {
    if (column_or_constant instanceof Model.Column) {
      return this.field(column_or_constant).value();
    } else {
      return column_or_constant;
    }
  }
});
