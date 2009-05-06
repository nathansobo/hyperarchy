require("/specs/june_spec_helper");

Screw.Unit(function(c) { with(c) {
  describe("Field", function() {
    var field;
    before(function() {
      field = User.find("bob").fields.first_name;
    });

    
    describe("#set_value", function() {
      it("calls #attribute.convert on the value before it is set", function() {
        var convert_args = [];
        field.attribute.convert = function(arg) {
          convert_args.push(arg);
          return arg + "'";
        }
        
        field.set_value("foo");
        expect(convert_args).to(equal, ["foo"]);
        expect(field.value).to(equal, "foo'");
      });
    });
  });
}});
    