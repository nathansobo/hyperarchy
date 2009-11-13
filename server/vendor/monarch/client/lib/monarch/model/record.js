
(function(Monarch) {

Monarch.constructor("Monarch.Model.Record", {
  constructor_properties: {
    extended: function(subconstructor) {
      subconstructor.table = new Monarch.Model.Relations.Table(this.determine_global_name(subconstructor), subconstructor);
      subconstructor.column("id", "string");
      subconstructor.relation_definitions = [];
      Repository.register_table(subconstructor.table);
    },

    column: function(name, type) {
      this[name] = this.table.define_column(name, type);
      this.prototype[name] = function() {
        var field = this.field(name);
        return field.value.apply(field, arguments);
      };
    },

    synthetic_column: function(name, definition) {
      this[name] = this.table.define_synthetic_column(name, definition);
      this.prototype[name] = function(value) {
        if (arguments.length == 0) {
          return this.field(name).value();
        } else {
          return this.field(name).value(value);
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

    has_many: function(target_table_name, options) {
      var self = this;
      options = options || {};
      var foreign_key_column_name = Monarch.Inflection.singularize(this.table.global_name) + "_id";
      this.relates_to_many(target_table_name, function() {
        var target_table = Repository.tables[target_table_name];
        var foreign_key_column = target_table.columns_by_name[foreign_key_column_name];
        var relation = target_table.where(foreign_key_column.eq(this.id()));

        if (options.order_by) relation = self.process_has_many_order_by_option(relation, options.order_by);
        return relation;
      });
    },

    process_has_many_order_by_option: function(relation, order_by) {
      if (order_by instanceof Array) {
        return relation.order_by.apply(relation, order_by);
      } else {
        return relation.order_by(order_by);
      }
    },

    determine_global_name: function(record_constructor) {
      return Monarch.Inflection.pluralize(Monarch.Inflection.underscore(record_constructor.basename));
    },

    create: function(field_values) {
      return this.table.create(field_values);
    },

    local_create: function(field_values) {
      var record = new this(field_values);
      this.table.insert(record);
      return record;
    },

    human_name: function() {
      return Monarch.Inflection.humanize(this.basename);
    },

    // delegate to table
    find: function(id) {
      return this.table.find(id);
    },

    fetch: function() {
      return this.table.fetch();
    },

    records: function() {
      return this.table.records();
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

    empty: function() {
      return this.table.empty();
    }
  },

  initialize: function(field_values_by_column_name) {
    this.primary_fieldset = new Monarch.Model.Fieldset(this);
    this.active_fieldset = this.primary_fieldset;
    if (field_values_by_column_name) {
      this.local_update(field_values_by_column_name);
    }
    this.primary_fieldset.initialize_synthetic_fields();
  },

  initialize_fields_by_column_name: function() {
    this.fields_by_column_name = {};
    for (var attr_name in this.constructor.table.columns_by_name) {
      var column = this.constructor.table.columns_by_name[attr_name];
      this.fields_by_column_name[attr_name] = new Monarch.Model.ConcreteField(this, column);
    }
  },

  initialize_relations: function() {
    var self = this;
    this.relations_by_name = {};
    Monarch.Util.each(this.constructor.relation_definitions, function(relation_definition) {
      self.relations_by_name[relation_definition.name] = relation_definition.definition.call(self);
    });
  },

  fetch: function() {
    return this.table().where(this.table().column('id').eq(this.id())).fetch();
  },

  update: function(values_by_method_name) {
    return Server.update(this, values_by_method_name);
  },

  destroy: function() {
    return Server.destroy(this);
  },

  populate_fields_with_errors: function(errors_by_field_name) {
    var self = this;
    Monarch.Util.each(errors_by_field_name, function(field_name, errors) {
      self.field(field_name).validation_errors = errors;
    });
  },

  all_validation_errors: function() {
    return this.active_fieldset.all_validation_errors();
  },

  start_pending_changes: function() {
    this.use_pending_fieldset(this.active_fieldset.new_pending_fieldset());
  },

  on_update: function(callback) {
    if (!this.on_update_node) this.on_update_node = new Monarch.SubscriptionNode();
    return this.on_update_node.subscribe(callback);
  },

  local_update: function(values_by_method_name) {
    this.active_fieldset.begin_batch_update();
    for (var method_name in values_by_method_name) {
      if (this[method_name]) {
        this[method_name](values_by_method_name[method_name]);
      }
    }
    this.active_fieldset.finish_batch_update();
  },

  local_destroy: function() {
    this.table().remove(this);
    if (this.after_destroy) this.after_destroy();
  },

  valid: function() {
    return this.active_fieldset.valid();
  },

  enable_update_events: function() {
    this.active_fieldset.enable_update_events();
  },

  disable_update_events: function() {
    this.active_fieldset.disable_update_events();
  },

  use_pending_fieldset: function(pending_fieldset) {
    this.active_fieldset = pending_fieldset;
  },

  restore_primary_fieldset: function() {
    this.active_fieldset = this.primary_fieldset;
  },

  table: function() {
    return this.constructor.table;
  },

  wire_representation: function() {
    return this.active_fieldset.wire_representation();
  },

  field: function(column) {
    return this.active_fieldset.field(column);
  },

  signal: function(column, optional_transformer) {
    return this.field(column).signal(optional_transformer);
  },

  evaluate: function(column_or_constant) {
    if (column_or_constant instanceof Monarch.Model.Column) {
      return this.field(column_or_constant).value();
    } else {
      return column_or_constant;
    }
  }
});

})(Monarch);
