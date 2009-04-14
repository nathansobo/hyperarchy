module("June", function(c) { with(c) {
  constructor("Attribute", function(c) {
    def('initialize', function(name, type, set) {
      this.name = name;
      this.type = type;
      this.set = set;
    });

    def('convert', function(value) {
      if (this.type == "integer") {
        return parseInt(value);
      } else if (this.type == "datetime") {
        return convert_date(value);
      } else if (value == null) {
        return value;
      } else {
        return value.toString();
      }

      function convert_date(value) {
        if (typeof value == "string") {
          return new Date(parseInt(value));
        } else if (typeof value == "number") {
          return new Date(value);
        } else {
          return value;
        }
      }
    });

    def('eq', function(other) {
      return new June.Predicates.EqualTo(this, other);
    });

    def('neq', function(other) {
      return new June.Predicates.NotEqualTo(this, other);
    })
  });
}});