constructor("Model.Relations.Table", {
  initialize: function(global_name, record_constructor) {
    this.global_name = global_name;
    this.record_constructor = record_constructor;
    this.attributes_by_name = {};
    this.records = [];
  },

  define_attribute: function(name, type) {
    return this.attributes_by_name[name] = new Model.Attribute(name, type);
  },

  all: function() {
    return this.records;
  },

  insert: function(record) {
    this.records.push(record);
  }

});