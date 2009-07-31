constructor("Model.Tuple", {
  eigenprops: {
    extended: function(subconstructor) {
      subconstructor.set = new Model.Relations.Set(this.determine_global_name(subconstructor));
    },

    determine_global_name: function(tuple_constructor) {
      return Inflection.pluralize(Inflection.underscore(tuple_constructor.basename))
    }
  }
});