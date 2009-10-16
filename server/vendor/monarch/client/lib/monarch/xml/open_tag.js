(function(Monarch) {

Monarch.constructor("Monarch.Xml.OpenTag", {
  initialize: function(name, attributes) {
    this.name = name;
    this.attributes = attributes;
  },

  to_xml: function() {
    return "<" + this.name + this.attributes_html() + ">"
  },

  attributes_html: function() {
    var attribute_pairs = [];
    for (var attribute_name in this.attributes) {
      attribute_pairs.push(attribute_name + '="' + this.attributes[attribute_name] + '"');
    }
    return (attribute_pairs.length > 0) ? " " + attribute_pairs.join(" ") : "";
  },

  post_process: function(builder) {
    builder.push_child();
  }
});

})(Monarch);
