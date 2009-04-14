module("Prez", function(c) { with(c) {
  constructor("PostProcessorInstruction", function() {
    def("initialize", function(function_name, arguments) {
      this.function_name = function_name;
      this.arguments = arguments;
    });

    def("to_string", function() {
      return "";
    });

    def("post_process", function(processor) {
      processor[this.function_name].apply(processor, this.arguments);
    });
  });
}});