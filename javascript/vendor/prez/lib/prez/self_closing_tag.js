module("Prez", function(c) { with(c) {
  constructor("SelfClosingTag", function() {
    def("initialize", function(tag_name, attributes) {
      this.tag_name = tag_name;
      this.attributes = attributes;
    });

    def('to_string', function() {
      var serialized_attributes = [];
      for(var attributeName in this.attributes) {
        serialized_attributes.push(attributeName + '="' + this.attributes[attributeName] + '"');
      }
      if(serialized_attributes.length > 0) {
        return "<" + this.tag_name + " " + serialized_attributes.join(" ") + " />";
      } else {
        return "<" + this.tag_name + " />";
      }
    });

    def('post_process', function(processor) {
      processor.push();  // we increase the parent's number of children
      processor.pop();   // but then remove this child -- it can have no children itself.  Parent's child count remains incremented.
    });
  });
}});