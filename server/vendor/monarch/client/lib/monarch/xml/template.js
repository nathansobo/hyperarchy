constructor("Xml.Template", {
  constructor_properties: {
    to_jquery: function(properties) {
      return new this().to_jquery(properties);
    },

    build: function(content_fn) {
      var template = new this();
      template.content = function() {
        content_fn.call(this, this.builder);
      }
      return template.to_view();
    }
  },

  to_jquery: function(properties) {
    var builder = new View.Builder(this);
    this.builder = builder;
    this.content(properties);
    this.builder = null;
    return builder.to_jquery();
  }
});
