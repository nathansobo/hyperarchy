constructor("Model.Relations.Table", {
  initialize: function(global_name, record_constructor) {
    this.global_name = global_name;
    this.record_constructor = record_constructor;
    this.columns_by_name = {};
    this.records = [];
  },

  define_column: function(name, type) {
    return this.columns_by_name[name] = new Model.Column(name, type);
  },

  all: function() {
    return this.records;
  },

  insert: function(record) {
    this.records.push(record);
  },

  wire_representation: function() {
    return {
      type: 'table',
      name: this.global_name
    };
  }
});