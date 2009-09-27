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
    var builder = new Xml.Builder(this);
    this.builder = builder;
    this.content(properties);
    this.builder = null;
    var jquery_fragment = builder.to_jquery();
    jquery_fragment.template = this;
    return jquery_fragment;
  }
});
