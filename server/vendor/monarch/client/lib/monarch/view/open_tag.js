(function(Monarch) {

Monarch.constructor("Monarch.View.OpenTag", {
  initialize: function(name, attributes) {
    this.name = name;
    this.attributes = attributes;
  },

  toXml: function() {
    return "<" + this.name + this.attributesHtml() + ">"
  },

  attributesHtml: function() {
    var attributePairs = [];
    for (var attributeName in this.attributes) {
      if (this.attributes[attributeName]) {
        attributePairs.push(attributeName + '="' + this.attributes[attributeName] + '"');
      }
    }
    return (attributePairs.length > 0) ? " " + attributePairs.join(" ") : "";
  },

  postProcess: function(builder) {
    builder.pushChild();
  }
});

})(Monarch);
