(function(Monarch) {

Monarch.constructor("Monarch.Model.Relations.Table", Monarch.Model.Relations.Relation, {
  has_operands: false,

  initialize: function(global_name, record_constructor) {
    this.global_name = global_name;
    this.record_constructor = record_constructor;
    this.columns_by_name = {};
    this.synthetic_columns_by_name = {};
    this._tuples = [];
    this.tuples_by_id = {};

    this.initialize_events_system();
    this.on_pause_events_node = new Monarch.SubscriptionNode();
    this.on_resume_events_node = new Monarch.SubscriptionNode();
  },

  define_column: function(name, type) {
    return this.columns_by_name[name] = new Monarch.Model.Column(this, name, type);
  },

  define_synthetic_column: function(name, definition) {
    return this.synthetic_columns_by_name[name] = new Monarch.Model.SyntheticColumn(this, name, definition);
  },

  create: function(field_values) {
    var record = this.local_create(field_values);
    return Server.save(record);
  },

  local_create: function(field_values) {
    var record = new this.record_constructor(field_values, this);
    record.is_remotely_created = false;
    this.insert(record);
    if (record.after_local_create) record.after_local_create();
    return record;
  },

  create_from_remote: function(field_values) {
    var record = new this.record_constructor(null, this);
    this.insert(record);
    record.remotely_created(field_values);
    return record;
  },

  remove: function(record) {
    delete this.tuples_by_id[record.id()];
    this.tuple_removed_remotely(record);
  },

  tuple_inserted_remotely: function(record) {
    this.tuples_by_id[record.id()] = record;
    this.on_remote_insert_node.publish(record);
  },

  all_tuples: function() {
    return this._tuples.concat();
  },

  find: function(predicate_or_id) {
    if (typeof predicate_or_id === "string") {
      var record = this.tuples_by_id[predicate_or_id]
      return (record && record.locally_destroyed) ? null : record;
    } else if (predicate_or_id) {
      return this.where(predicate_or_id).first();
    } else {
      throw new Error("You called find with null id");
    }
  },

  column: function(name) {
    return this.columns_by_name[name];
  },

  surface_tables: function() {
    return [this];
  },

  wire_representation: function() {
    return {
      type: 'table',
      name: this.global_name
    };
  },

  pause_events: function() {
    this.on_remote_insert_node.pause_events();
    this.on_remote_remove_node.pause_events();
    this.on_remote_update_node.pause_events();
    this.on_pause_events_node.publish();
  },

  resume_events: function() {
    this.on_remote_insert_node.resume_events();
    this.on_remote_remove_node.resume_events();
    this.on_remote_update_node.resume_events();
    this.on_resume_events_node.publish();
  },

  on_pause_events: function(callback) {
    return this.on_pause_events_node.subscribe(callback);
  },

  on_resume_events: function(callback) {
    return this.on_resume_events_node.subscribe(callback);
  },
  
  update_contents: function(dataset) {
    var self = this;
    Monarch.Util.each(dataset, function(id, field_values) {
      var extant_record = self.find(id);
      if (extant_record) {
        extant_record.remotely_updated(field_values);
      } else {
        self.create_from_remote(field_values)
      }
    });
  },
  
  delta_contents: function(dataset) {
    this.each(function(record) {
      if (!dataset[record.id()]) {
        record.remotely_destroyed();
      }
    });
    this.update_contents(dataset);
  },
  
  load_fixtures: function(fixture_definitions) {
    var self = this;
    Monarch.Util.each(fixture_definitions, function(id, properties) {
      var field_values = Monarch.Util.extend({id: id}, properties)
      self.create_from_remote(field_values);
    });
  },

  clear: function() {
    this._tuples = [];
    this.tuples_by_id = {}
    this.on_remote_insert_node = new Monarch.SubscriptionNode();
    this.on_remote_remove_node = new Monarch.SubscriptionNode();
    this.on_remote_update_node = new Monarch.SubscriptionNode();
    this.on_pause_events_node = new Monarch.SubscriptionNode();
    this.on_resume_events_node = new Monarch.SubscriptionNode();
  },

  clone_schema: function() {
    var clone = new Monarch.Model.Relations.Table(this.global_name, this.record_constructor);
    clone.columns_by_name = this.columns_by_name;
    return clone;
  },

  evaluate_in_repository: function(repository) {
    return repository.tables[this.global_name];
  },

  primary_table: function() {
    return this;
  },

  // private

  insert: function(record) {
    this._tuples.push(record);
    if (record.id()) this.tuples_by_id[record.id()] = record;
    record.initialize_relations();
  }
});

})(Monarch);
