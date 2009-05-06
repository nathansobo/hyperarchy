module("June", function(c) { with(c) {
  constructor("Field", function() {
    def('initialize', function(attribute) {
      this.attribute = attribute;
    });

    def('set_value', function(value) {
      return this.value = this.attribute.convert(value);
    });

    def('get_value', function(value) {
      return this.value;
    });
  });
}});
