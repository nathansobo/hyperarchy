//= require "../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("ModuleSystem", function() {
    describe("#module", function() {
      context("when given a top-level module name and a properties hash", function() {
        context("when no module with that name is defined", function() {
          after(function() {
            delete window['Foo'];
          });

          it("defines a new top level module by the given name with the properties", function() {
            expect(window['Foo']).to(be_undefined);
            ModuleSystem.module("Foo", {
              foo: "foo",
              bar: "bar"
            });
            expect(Foo).to_not(be_undefined);
            expect(Foo.foo).to(equal, "foo");
            expect(Foo.bar).to(equal, "bar");
          });
        });

        context("when a module with that name is already defined", function() {
          before(function() {
            expect(window['Foo']).to(be_undefined);
            ModuleSystem.module("Foo", {
              foo: "foo",
              bar: "bar"
            });
          });

          after(function() {
            delete window['Foo'];
          });

          it("mixes the given properties into the existing module", function() {
            ModuleSystem.module("Foo", {
              bar: "bar2",
              baz: "baz"
            });
            expect(Foo.foo).to(equal, "foo");
            expect(Foo.bar).to(equal, "bar2");
            expect(Foo.baz).to(equal, "baz");
          });
        });
      });

      context("when given a qualified module name and a properties hash", function() {
        after(function() {
          delete window['Foo'];
        });

        context("when no modules along the given path exist", function() {
          it("creates all modules along the path and installs the properties at its terminus", function() {
            expect(window['Foo']).to(be_undefined);

            ModuleSystem.module("Foo.Bar.Baz", {
              foo: "foo",
              bar: "bar"
            });

            expect(Foo).to_not(be_undefined);
            expect(Foo.Bar).to_not(be_undefined);
            expect(Foo.Bar.Baz).to_not(be_undefined);
            expect(Foo.Bar.Baz.foo).to(equal, "foo");
            expect(Foo.Bar.Baz.bar).to(equal, "bar");
          });
        });

        context("when modules along the given path exists, but not the terminus", function() {
        });
      });
    });
  });
}});