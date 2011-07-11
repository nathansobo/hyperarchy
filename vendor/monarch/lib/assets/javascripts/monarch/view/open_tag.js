(function(Monarch) {

_.constructor("Monarch.View.OpenTag", {
  initialize: function(name, attributes) {
    if (name === 'a') {
      if (!attributes) attributes = {};
      if (!attributes.href) attributes.href = 'javascript:void(0)';
    }
    
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
