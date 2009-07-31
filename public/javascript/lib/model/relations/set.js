constructor("Model.Relations.Set", {
  initialize: function(global_name, tuple_constructor) {
    this.global_name = global_name;
    this.tuple_constructor = tuple_constructor;
    this.attributes_by_name = {};
    this.tuples = [];
  },

  define_attribute: function(name, type) {
    return this.attributes_by_name[name] = new Model.Attribute(name, type);
  },

  all: function() {
    return this.tuples;
  },

  insert: function(tuple) {
    this.tuples.push(tuple);
  }

});