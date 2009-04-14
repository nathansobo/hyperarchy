module("Prez", function(c) { with(c) {
  constructor("CloseTag", function() {
    def("initialize", function(tag_name) {
      this.tag_name = tag_name;
    });

    def("to_string", function() {
      return "</" + this.tag_name + ">";
    });

    def("post_process", function(processor) {
      processor.pop();
    });
  });
}});