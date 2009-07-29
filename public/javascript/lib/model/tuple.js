constructor("Model.Tuple", {
  eigenprops: {
    extended: function(subconstructor) {
      subconstructor.set = new Model.Relations.Set(this.convert_to_global_name(subconstructor.basename));
    },

    convert_to_global_name: function(tuple_constructor_name) {
      return Inflection.pluralize(Inflection.underscore(tuple_constructor_name))
    }
  }
});