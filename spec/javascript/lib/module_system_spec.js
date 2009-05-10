//= require "../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("ModuleSystem", function() {
    describe(".constructor", function() {
      describe("naming and prototype property definition", function() {
        after(function() {
          delete window['Foo'];
        });

        context("when given a top-level name and a properties hash", function() {
          it("creates a constructor with that name, defining the given properties on its prototype", function() {
            expect(window['Foo']).to(be_undefined);

            ModuleSystem.constructor("Foo", {
              foo: "foo",
              bar: "bar"
            });

            expect(Foo).to_not(be_undefined);
            expect(Foo.prototype.foo).to(equal, "foo");
            expect(Foo.prototype.bar).to(equal, "bar");
          });
        });

        context("when given a qualified name and a properties hash", function() {
          context("when no modules along the given path exist", function() {
            it("creates all modules along the path and creates the constructor at its terminus whose prototype has the given properties", function() {
              expect(window['Foo']).to(be_undefined);

              ModuleSystem.constructor("Foo.Bar.Baz", {
                foo: "foo",
                bar: "bar"
              });

              expect(Foo).to_not(be_undefined);
              expect(Foo.Bar).to_not(be_undefined);
              expect(Foo.Bar.Baz).to_not(be_undefined);
              expect(Foo.Bar.Baz.prototype.foo).to(equal, "foo");
              expect(Foo.Bar.Baz.prototype.bar).to(equal, "bar");
            });
          });

          context("when modules along the given path exists, but not the terminus", function() {
            before(function() {
              ModuleSystem.module("Foo", {
                foo: "foo"
              });
            });

            it("creates any module that does not yet exist, but leaves existing modules intact", function() {
              ModuleSystem.constructor("Foo.Bar.Baz", {
                foo: "foo",
                bar: "bar"
              });

              expect(Foo.foo).to_not(be_undefined);
              expect(Foo.Bar.Baz).to_not(be_undefined);
              expect(Foo.Bar.Baz.prototype.foo).to(equal, "foo");
              expect(Foo.Bar.Baz.prototype.bar).to(equal, "bar");
            });
          });
        });
      });

      describe("inheritance", function() {
        
      });

    });

    describe(".module", function() {
      after(function() {
        delete window['Foo'];
      });

      context("when given a top-level name and a properties hash", function() {
        context("when no module with that name is defined", function() {
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
          before(function() {
            ModuleSystem.module("Foo", {
              foo: "foo"
            });
          });

          it("creates any module that does not yet exist, but leaves existing modules intact", function() {
            ModuleSystem.module("Foo.Bar.Baz", {
              foo: "foo",
              bar: "bar"
            });
            
            expect(Foo.foo).to_not(be_undefined);
            expect(Foo.Bar.Baz).to_not(be_undefined);
            expect(Foo.Bar.Baz.foo).to(equal, "foo");
            expect(Foo.Bar.Baz.bar).to(equal, "bar");
          });
        });

        context("when all modules, including the terminus, exist", function() {
          before(function() {
            ModuleSystem.module("Foo.Bar.Baz", {
              foo: "foo",
              bar: "bar"
            });
          });

          it("mixes the given properties into the existing modules", function() {
            ModuleSystem.module("Foo.Bar.Baz", {
              bar: "bar2",
              baz: "baz"
            });

            expect(Foo.Bar.Baz.foo).to(equal, "foo");
            expect(Foo.Bar.Baz.bar).to(equal, "bar2");
            expect(Foo.Bar.Baz.baz).to(equal, "baz");
          });
        });
      });
    });

    describe(".extend", function() {
      var object;

      before(function() {
        Super = function() {};
        ModuleSystem.mixin(Super.prototype, {
          not_overridden_function: function() {
            return "not_overridden_function";
          },

          overridden_function: function() {
            return "overridden_function superconstructor version";
          },

          not_overridden_property: "not_overridden_property"
        });

        Sub = function() {};
        ModuleSystem.mixin(Sub.prototype, {
          overridden_function: function() {
            return "overridden_function";
          },

          overridden_function: function() {
            return "overridden_function subconstructor version";
          },

          in_sub_only: function() {
            return "in_sub_only";
          }
        });

        ModuleSystem.extend(Super, Sub);

        object = new Sub();
      });

      after(function() {
        delete window['Super'];
        delete window['Sub'];
      });


      describe("functions in superconstructor prototype that are not overridden in subconstructor prototype", function() {
        they("are inherited by objects created by the subconstructor", function() {
          expect(object.not_overridden_function()).to(equal, "not_overridden_function");
        });
      });

      describe("properties in superconstructor prototype that are not overridden in subconstructor", function() {
        they("are inherited by objects created by the subconstructor", function() {
          expect(object.not_overridden_property).to(equal, "not_overridden_property");
        });
      });

      describe("functions in superconstructor prototype that are overridden in subconstructor prototype", function() {
        they("are overridden for objects created by the subconstructor", function() {
          expect(object.overridden_function()).to(equal, "overridden_function subconstructor version");
        });
      });
    });

    describe(".mixin", function() {
      it("adds all the properties in the second module to the first, overwriting any with the same name", function() {
        var a = {
          foo: "foo",
          bar: "bar"
        }

        var b =  {
          bar: "bar2",
          baz: "baz"
        }

        var result = ModuleSystem.mixin(a, b);
        expect(result).to(equal, a);

        expect(a.foo).to(equal, "foo");
        expect(a.bar).to(equal, "bar2");
        expect(a.baz).to(equal, "baz");
      });
    });
  });
}});