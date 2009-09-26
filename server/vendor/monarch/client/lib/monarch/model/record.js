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
      this.prototype[name] = function() {
        var field = this.field(name);
        return field.value.apply(field, arguments);
      };
    },

    synthetic_column: function(name, definition) {
      this[name] = this.table.define_synthetic_column(name, definition);
      this.prototype[name] = function() {
        return this.field(name).value();
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
      var foreign_key_column_name = Inflection.singularize(this.table.global_name) + "_id";
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
      return Inflection.pluralize(Inflection.underscore(record_constructor.basename));
    },

    create: function(field_values) {
      var self = this;
      var future = new Http.AjaxFuture();
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
    }
  },

  initialize: function(field_values_by_column_name) {
    this.primary_fieldset = new Model.Fieldset(this);
    this.active_fieldset = this.primary_fieldset;
    if (field_values_by_column_name) {
      this.active_fieldset.disable_update_events();
      this.local_update(field_values_by_column_name);
      this.active_fieldset.enable_update_events();
    }
    this.primary_fieldset.initialize_synthetic_fields();
    this.initialize_relations();
  },

  initialize_fields_by_column_name: function() {
    this.fields_by_column_name = {};
    for (var attr_name in this.constructor.table.columns_by_name) {
      var column = this.constructor.table.columns_by_name[attr_name];
      this.fields_by_column_name[attr_name] = new Model.ConcreteField(this, column);
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

  update: function(values_by_method_name) {
    this.start_pending_changes();
    this.local_update(values_by_method_name);
    return this.push();
  },

  start_pending_changes: function() {
    this.active_fieldset = this.active_fieldset.new_pending_fieldset();
  },

  push: function() {
    var push_future = new Http.RepositoryUpdateFuture();
    var pending_fieldset = this.active_fieldset;
    this.restore_primary_fieldset();

    Server.put(Repository.origin_url, {
      id: this.id(),
      relation: this.table().wire_representation(),
      field_values: pending_fieldset.wire_representation()
    })
      .on_success(function(data) {
        pending_fieldset.update(data.field_values);
        pending_fieldset.commit({
          before_events: function() {
            push_future.trigger_before_events();
          },
          after_events: function() {
            push_future.trigger_after_events();
          }
        });
      });
    
    return push_future;
  },

  restore_primary_fieldset: function() {
    this.active_fieldset = this.primary_fieldset;
  },

  local_update: function(values_by_method_name, options) {
    if (!options) options = {};
    this.active_fieldset.begin_batch_update();
    for (var method_name in values_by_method_name) {
      if (this[method_name]) {
        this[method_name].call(this, values_by_method_name[method_name]);
      }
    }
    if (options.before_events) options.before_events();
    this.active_fieldset.finish_batch_update();
    if (options.after_events) options.after_events();
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
    if (column_or_constant instanceof Model.Column) {
      return this.field(column_or_constant).value();
    } else {
      return column_or_constant;
    }
  }
});
