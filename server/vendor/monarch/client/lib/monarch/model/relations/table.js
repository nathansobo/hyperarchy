(function(Monarch, jQuery) {

Monarch.constructor("Monarch.Model.Relations.Table", Monarch.Model.Relations.Relation, {
  has_operands: false,

  initialize: function(global_name, record_constructor) {
    this.global_name = global_name;
    this.record_constructor = record_constructor;
    this.columns_by_name = {};
    this.synthetic_columns_by_name = {};
    this._records = [];
    this.records_by_id = {};

    this.initialize_events_system();
  },

  define_column: function(name, type) {
    return this.columns_by_name[name] = new Monarch.Model.Column(this, name, type);
  },

  define_synthetic_column: function(name, definition) {
    return this.synthetic_columns_by_name[name] = new Monarch.Model.SyntheticColumn(this, name, definition);
  },

  column: function(name) {
    return this.columns_by_name[name];
  },

  records: function() {
    return this._records.concat();
  },

  insert: function(record, options) {
    this.records_by_id[record.id()] = record;
    record.enable_update_events();
    this.record_inserted(record, options);
  },

  remove: function(record, options) {
    delete this.records_by_id[record.id()];
    this.record_removed(record, options);
  },

  create: function(field_values) {
    return Server.create(this, field_values);
  },

  local_create: function(field_values) {
    return this.record_constructor.local_create(field_values);
  },

  find: function(predicate_or_id) {
    if (typeof predicate_or_id === "string") {
      return this.records_by_id[predicate_or_id];
    } else {
      return this.where(predicate_or_id).first();
    }
  },

  wire_representation: function() {
    return {
      type: 'table',
      name: this.global_name
    };
  },

  pause_events: function() {
    this.on_insert_node.pause_events();
    this.on_remove_node.pause_events();
    this.on_update_node.pause_events();
  },

  resume_events: function() {
    this.on_insert_node.resume_events();
    this.on_remove_node.resume_events();
    this.on_update_node.resume_events();
  },

  update: function(dataset) {
    var self = this;
    Monarch.Util.each(dataset, function(id, attributes) {
      var extant_record = self.find(id);
      if (extant_record) {
        extant_record.local_update(attributes);
      } else {
        self.record_constructor.local_create(attributes)
      }
    });
  },

  fixtures: function(fixture_definitions) {
    this.fixture_definitions = fixture_definitions;
  },

  load_fixtures: function() {
    if (!this.fixture_definitions) return;
    var self = this;
    Monarch.Util.each(this.fixture_definitions, function(id, properties) {
      var attributes = jQuery.extend({id: id}, properties)
      self.insert(new self.record_constructor(attributes));
    });
  },

  clear: function() {
    this._records = [];
    this.records_by_id = {}
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
  }
});

})(Monarch, jQuery);
