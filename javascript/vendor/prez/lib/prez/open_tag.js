module("Prez", function(c) { with(c) {
  constructor("OpenTag", function() {
    def("initialize", function(tag_name, attributes) {
      this.tag_name = tag_name;
      this.attributes = attributes;
    });

    def("to_string", function() {
      var serialized_attributes = [];
      for(var attributeName in this.attributes) {
        serialized_attributes.push(attributeName + '="' + this.attributes[attributeName] + '"');
      }
      if(serialized_attributes.length > 0) {
        return "<" + this.tag_name + " " + serialized_attributes.join(" ") + ">";
      } else {
        return "<" + this.tag_name + ">";
      }
    })

    def("post_process", function(processor) {
      processor.push();
    });
  });
}});