module("Prez", function(c) { with(c) {
  constructor("Text", function() {
    def("initialize", function(value) {
      this.value = value;
    });


    def("to_string", function() {
      return this.value;
    });

    def("post_process", function(processor) {
      // NO-OP
    });
  });
}});