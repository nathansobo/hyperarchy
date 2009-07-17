//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views constructed with View.Template#to_view", function() {
    describe("#field_values", function() {
      after(function() {
        delete window['TestTemplate'];
      });

      it("returns a hash of name value pairs for all input elements on the view", function() {
        ModuleSystem.constructor("TestTemplate", View.Template, {
          content: function() { with(this.builder) {
            div(function() {
              input({name: "foo", value: "Foo"});
              input({name: "bar", value: "Bar"});
              input({name: "baz", value: "Baz"});
            });
          }}
        });

        expect(TestTemplate.to_view().field_values()).to(equal, {
          foo: "Foo",
          bar: "Bar",
          baz: "Baz"
        });
      });
    });
  });
}});