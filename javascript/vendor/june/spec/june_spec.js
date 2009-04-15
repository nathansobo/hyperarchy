require("/specs/june_spec_helper");

Screw.Unit(function(c) { with(c) {
  describe("June", function() {
    describe(".GlobalDomain", function() {
      it("is an instance of June.Domain", function() {
        expect(June.GlobalDomain.constructor).to(equal, June.Domain);
      });
    });

    describe(".define_set", function() {
      it("delegates to June.GlobalDomain", function() {
        mock(June.GlobalDomain, "define_set");
        var definition = function() {};
        June.define_set("Foo", definition);
        expect(June.GlobalDomain.define_set).to(have_been_called, with_args("Foo", definition));
      });
    });
  });
}});