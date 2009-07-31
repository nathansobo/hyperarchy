constructor("Model.Tuple", {
  eigenprops: {
    extended: function(subconstructor) {
      subconstructor.set = new Model.Relations.Set(this.determine_global_name(subconstructor));
    },

    attribute: function(name, type) {
      this[name] = this.set.define_attribute(name, type);
      this.prototype[name] = function(value) {
        var field = this.fields_by_attribute_name[name];
        if (value) {
          return field.value(value);
        } else {
          return field.value();
        }
      };
    },

    determine_global_name: function(tuple_constructor) {
      return Inflection.pluralize(Inflection.underscore(tuple_constructor.basename));
    }
  },

  initialize: function() {
    if (this.constructor == Model.Tuple) return;
    this.initialize_fields_by_attribute_name();
  },

  initialize_fields_by_attribute_name: function() {
    this.fields_by_attribute_name = {};
    for (var attribute_name in this.constructor.set.attributes_by_name) {
      var attribute = this.constructor.set.attributes_by_name[attribute_name];
      this.fields_by_attribute_name[attribute_name] = new Model.Field(this, attribute);
    }
  }
});