
(function(Monarch) {

Monarch.constructor("Monarch.Model.Record", {
  constructor_properties: {
    initialize: function() {
      this.delegate_constructor_methods('find', 'fetch', 'tuples', 'each', 'any', 'on_local_update', 'on_remote_insert',
                                        'on_remote_update', 'on_remote_remove', 'where', 'order_by', 'project', 'empty',
                                        'table');
    },

    extended: function(subconstructor) {
      subconstructor.table = new Monarch.Model.Relations.Table(this.determine_global_name(subconstructor), subconstructor);
      subconstructor.column("id", "string");
      subconstructor.relation_definitions = [];
      Repository.register_table(subconstructor.table);
    },

    column: function(name, type) {
      this.generate_column_accessors(this.table.define_column(name, type));
    },

    synthetic_column: function(name, definition) {
      this.generate_column_accessors(this.table.define_synthetic_column(name, definition));
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

    has_many: function(relation_name, options) {
      var self = this;
      options = options || {};
      var conditions = options.conditions || {};

      var target_table_name = options.table || relation_name;
      var foreign_key_column_name = options.key || Monarch.Inflection.singularize(this.table.global_name) + "_id";

      this.relates_to_many(relation_name, function() {
        var target_table = Repository.tables[target_table_name];
        conditions[foreign_key_column_name] = this.id();
        var relation = target_table.where(conditions);

        if (options.order_by) relation = self.process_has_many_order_by_option(relation, options.order_by);
        return relation;
      });
    },

    create: function(field_values) {
      return this.table.create(field_values);
    },

    local_create: function(field_values) {
      return this.table.local_create(field_values);
    },

    remotely_created: function(field_values) {
      return this.table.remotely_created(field_values);
    },

    human_name: function() {
      return Monarch.Inflection.humanize(this.basename);
    },

    // private

    generate_column_accessors: function(column) {
      if (column.name == "name") {
        this["name_"] = column; // name property of functions is read-only in webkit
      } else {
        this[column.name] = column;
      }

      this.prototype[column.name] = function() {
        var field = this.field(column.name);
        return field.value.apply(field, arguments);
      };
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
    }
  },

  initialize: function(field_values_by_column_name, table) {
    this.table = table;
    this.remote = new Monarch.Model.RemoteFieldset(this);
    this.local = new Monarch.Model.LocalFieldset(this, this.remote);
    this.subscriptions = new Monarch.SubscriptionBundle();
    this.initialize_subscription_nodes();
    this.subscribe_to_self_mutations();
    if (field_values_by_column_name) this.local_update(field_values_by_column_name);
    this.local.update_events_enabled = true;
    this.remote.initialize_synthetic_fields();
    this.local.initialize_synthetic_fields();
  },

  fetch: function() {
    return this.table.where(this.table.column('id').eq(this.id())).fetch();
  },

  save: function() {
    return Server.save(this);
  },

  local_update: function(values_by_method_name) {
    this.local.begin_batch_update();
    for (var method_name in values_by_method_name) {
      if (this[method_name]) {
        this[method_name](values_by_method_name[method_name]);
      }
    }
    this.local.finish_batch_update();
  },

  local_destroy: function() {
    this.locally_destroyed = true;
  },

  update: function(values_by_method_name) {
    this.local_update(values_by_method_name);
    return this.save();
  },

  destroy: function() {
    this.local_destroy();
    return Server.save(this);
  },

  remotely_created: function(field_values) {
    this.remote.update(field_values);
    this.is_remotely_created = true;
    this.remote.update_events_enabled = true;
    this.initialize_relations();
    this.table.tuple_inserted_remotely(this);
    this.on_remote_create_node.publish(this);
  },

  remotely_updated: function(field_values) {
    this.remote.update(field_values);
  },

  remotely_destroyed: function() {
    this.table.remove(this);
    this.on_remote_destroy_node.publish(this);
  },

  on_remote_update: function(callback) {
    return this.on_remote_update_node.subscribe(callback);
  },

  on_local_update: function(callback) {
    if (!this.on_local_update_node) this.on_local_update_node = new Monarch.SubscriptionNode();
    return this.on_local_update_node.subscribe(callback);
  },

  on_remote_destroy: function(callback) {
    return this.on_remote_destroy_node.subscribe(callback);
  },

  on_remote_create: function(callback) {
    return this.on_remote_create_node.subscribe(callback)
  },

  on_dirty: function(callback) {
    if (!this.on_dirty_node) this.on_dirty_node = new Monarch.SubscriptionNode();
    return this.on_dirty_node.subscribe(callback);
  },

  on_clean: function(callback) {
    if (!this.on_clean_node) this.on_clean_node = new Monarch.SubscriptionNode();
    return this.on_clean_node.subscribe(callback);
  },

  on_invalid: function(callback) {
    if (!this.on_invalid_node) this.on_invalid_node = new Monarch.SubscriptionNode();
    return this.on_invalid_node.subscribe(callback);
  },

  on_valid: function(callback) {
    if (!this.on_valid_node) this.on_valid_node = new Monarch.SubscriptionNode();
    return this.on_valid_node.subscribe(callback);
  },

  valid: function() {
    return this.local.valid();
  },

  clear_validation_errors: function() {
    this.local.clear_validation_errors();
  },

  assign_validation_errors: function(errors_by_field_name) {
    this.local.assign_validation_errors(errors_by_field_name);
    if (this.on_invalid_node) this.on_invalid_node.publish();
  },

  all_validation_errors: function() {
    return this.local.all_validation_errors();
  },

  dirty: function() {
    return this.locally_destroyed || !this.is_remotely_created || this.local.dirty();
  },

  dirty_wire_representation: function() {
    return this.local.dirty_wire_representation();
  },

  wire_representation: function() {
    return this.local.wire_representation();
  },

  field: function(column) {
    return this.local.field(column);
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
  },

  record: function(table) {
    return this.table === table ? this : null;
  },

  pause_events: function() {
    this.on_remote_create_node.pause_events();
    this.on_remote_update_node.pause_events();
    this.on_remote_destroy_node.pause_events();
  },

  resume_events: function() {
    this.on_remote_create_node.resume_events();
    this.on_remote_update_node.resume_events();
    this.on_remote_destroy_node.resume_events();
  },

  made_dirty: function() {
    if (this.on_dirty_node) this.on_dirty_node.publish();
    this.table.record_made_dirty(this);
  },

  made_clean: function() {
    if (this.on_clean_node) this.on_clean_node.publish();
    this.table.record_made_clean(this);
  },

  cleanup: function() {
    this.subscriptions.destroy_all();
  },

  equals: function(other) {
    return this === other;
  },

  hash_code: function() {
    return this.id();
  },

  // private
  initialize_subscription_nodes: function() {
    var self = this;
    this.on_remote_update_node = new Monarch.SubscriptionNode();
    this.on_remote_destroy_node = new Monarch.SubscriptionNode();
    this.on_remote_create_node = new Monarch.SubscriptionNode();

    this.subscriptions.add(this.table.on_pause_events(function() {
      self.pause_events();
    }));

    this.subscriptions.add(this.table.on_resume_events(function() {
      self.resume_events();
    }));
  },

  subscribe_to_self_mutations: function() {
    var self = this;

    this.on_remote_create_node.subscribe(function(changeset) {
      if (self.after_remote_create) self.after_remote_create();
    });

    this.on_remote_update_node.subscribe(function(changeset) {
      if (self.after_remote_update) self.after_remote_update(changeset);
    });

    this.on_remote_destroy_node.subscribe(function() {
      if (self.after_remote_destroy) self.after_remote_destroy();
      self.cleanup();
    });
  },

  initialize_relations: function() {
    var self = this;
    this.relations_by_name = {};
    Monarch.Util.each(this.constructor.relation_definitions, function(relation_definition) {
      self.relations_by_name[relation_definition.name] = relation_definition.definition.call(self);
    });
  }
});

})(Monarch);
