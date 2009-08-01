//= require "../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("ModuleSystem", function() {
    describe(".constructor", function() {
      after(function() {
        delete window['Foo'];
      });

      it("assigns a 'basename' property to the created constructor", function() {
        ModuleSystem.constructor("Foo");
        expect(Foo.basename).to(equal, "Foo");
        ModuleSystem.constructor("Foo.Bar");
        expect(Foo.Bar.basename).to(equal, "Bar");
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

      context("when given a superconstructor as its second argument", function() {
        before(function() {
          ModuleSystem.constructor("Super", {});
        });

        after(function() {
          delete window["Super"];
        });

        it("extends the constructor being defined from the given superconstructor", function() {
          mock(ModuleSystem, 'extend');
          ModuleSystem.constructor("Foo", Super, {});
          expect(ModuleSystem.extend).to(have_been_called, with_args(Super, Foo));
        });

        context("if .extended is defined as an eigenproperty on the superconstructor", function() {
          it("it calls the method with the subconstructor after the subconstructor has been fully defined", function() {
            var constructor;
            Super.extended = mock_function("Super.extended", function() {
              expect(window.Foo).to_not(be_undefined);
              expect(window.Foo.foo).to(equal, "foo");
            });
            constructor = ModuleSystem.constructor("Foo", Super, {
              eigenprops: {
                foo: "foo"
              }
            });
            expect(Super.extended).to(have_been_called, with_args(Foo));
          });
        });
      });

      context("when given modules as arguments following the name", function() {
        before(function() {
          ModuleSystem.module("Bar", {});
          ModuleSystem.module("Baz", {});
        });

        after(function() {
          delete window["Bar"];
          delete window["Baz"];
        });

        it("mixes the given module into the constructor's prototype", function() {
          mock(ModuleSystem, "mixin");
          ModuleSystem.constructor("Foo", Bar, Baz, {});

          expect(ModuleSystem.mixin).to(have_been_called, thrice);
          expect(ModuleSystem.mixin.call_args[0]).to(equal, [Foo.prototype, Bar]);
          expect(ModuleSystem.mixin.call_args[1]).to(equal, [Foo.prototype, Baz]);
        });
      });

      context("when an #initialize method is defined on the prototype", function() {
        before(function() {
          ModuleSystem.constructor("Foo", {
            initialize: mock_function("initialize method")
          });
        });

        it("causes the constructor to invoke #initialize with its arguments", function() {
          new Foo("foo", "bar");
          expect(Foo.prototype.initialize).to(have_been_called, with_args("foo", "bar"));
        });
      });

      context("when an #eigenprops property is defined on the prototype", function() {
        it("defines those properties on the constructor itself", function() {
          ModuleSystem.constructor("Foo", {
            eigenprops: {
              foo: "foo"
            }
          });

          expect(Foo.foo).to(equal, "foo");
        });

        context("when there is an #initialize eigenprop", function() {
          it("invokes the initializer after the constructor is fully assembled", function() {
            ModuleSystem.constructor("Foo", {
              eigenprops: {
                initialize: function() {
                  if (!this.prototype.foo) throw new Error("prototype should be assembled");
                  this.eigen_initialize_called = true;
                }
              },
              
              foo: "foo"
            });

            expect(Foo.eigen_initialize_called).to(be_true);
          });
        });
      });

      context("when an #eigenprops properties are defined on the superconstructor and the mixed-in modules", function() {
        var mixin_module, subconstructor_prototype;

        before(function() {
          ModuleSystem.constructor("Super", {
            eigenprops: {
              foo: "foo super",
              bar: "bar super",
              boing: "boing"
            }
          });

          mixin_module = {
            eigenprops: {
              bar: "bar module",
              baz: "baz module"
            }
          };

          subconstructor_prototype = {
            eigenprops: {
              foo: "foo sub",
              baz: "baz sub",
              bop: "bop"
            }
          };

          ModuleSystem.constructor("Sub", Super, mixin_module, subconstructor_prototype);
        });

        after(function() {
          delete window['Super'];
          delete window['Sub'];
        });

        it("combines the eigenproperties into an 'eigenprops' hash on the prototype of the defined constructor, giving precedence to modules included later", function() {
          expect(Sub.prototype.eigenprops).to(equal, {
            foo: "foo sub",
            bar: "bar module",
            baz: "baz sub",
            bop: "bop",
            boing: "boing"
          });
        });

        it("defines the merged eigenproperties as properties on the defined constructor itself", function() {
          expect(Sub.foo).to(equal, "foo sub");
          expect(Sub.bar).to(equal, "bar module");
          expect(Sub.baz).to(equal, "baz sub");
          expect(Sub.bop).to(equal, "bop");
          expect(Sub.boing).to(equal, "boing");
        });
        
        it("does not mutate the 'eigenprops' hashes on the superconstructor or any of the included modules", function() {
          expect(Super.prototype.eigenprops).to(equal, {
            foo: "foo super",
            bar: "bar super",
            boing: "boing"
          });

          expect(mixin_module.eigenprops).to(equal, {
            bar: "bar module",
            baz: "baz module"
          });;

          expect(subconstructor_prototype.eigenprops).to(equal, {
            foo: "foo sub",
            baz: "baz sub",
            bop: "bop"
          });
        });
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
        ModuleSystem.constructor("Super", {
          eigenprops: {
            super_eigenprop: "super_eigenprop",
            extended: mock_function()
          },

          initialize: mock_function(),

          not_overridden_function: function() {
            return "not_overridden_function";
          },

          overridden_function: function() {
            return "overridden_function superconstructor version";
          },

          overridden_property: "overridden_property superconstructor version",
          not_overridden_property: "not_overridden_property"
        });

        ModuleSystem.constructor("Sub", {
          eigenprops: {
            sub_eigenprop: 'sub_eigenprop'
          },

          overridden_function: function() {
            return "overridden_function";
          },

          overridden_function: function() {
            return "overridden_function subconstructor version";
          },

          overridden_property: "overridden_property subconstructor version",

          sub_only_function: function() {
            return "sub_only_function";
          },

          sub_only_property: "sub_only_property"
        });

        ModuleSystem.extend(Super, Sub);

        object = new Sub();
      });

      after(function() {
        delete window['Super'];
        delete window['Sub'];
      });

      it("does not invoke the superconstructor's initialize method when creating the prototypical object", function() {
        Super.prototype.initialize.clear();
        ModuleSystem.extend(Super, Sub);
        expect(Super.prototype.initialize).to_not(have_been_called);
      });

      describe("functions and properties on the superconstructor prototype that are not overridden in the subconstructor prototype", function() {
        they("are inherited by objects created by the subconstructor", function() {
          expect(object.not_overridden_function()).to(equal, "not_overridden_function");
          expect(object.not_overridden_property).to(equal, "not_overridden_property");
        });
      });

      describe("functions and properties on the superconstructor prototype that are overridden in the subconstructor prototype", function() {
        they("are overridden for objects created by the subconstructor", function() {
          expect(object.overridden_function()).to(equal, "overridden_function subconstructor version");
          expect(object.overridden_property).to(equal, "overridden_property subconstructor version");
        });
      });

      context("if an 'eigenprops' property is defined on the superconstructor's prototype", function() {
        it("merges the the eigenprops of the subconstructor into a copy of those defined on the superconstructor, without mutating the eigenprops of the superconstructor", function() {
          expect(Sub.prototype.eigenprops).to(equal, {
            super_eigenprop: 'super_eigenprop',
            sub_eigenprop: 'sub_eigenprop',
            extended: Super.extended
          });

          expect(Super.prototype.eigenprops).to(equal, {
            super_eigenprop: 'super_eigenprop',
            extended: Super.extended
          });
        });
      });
    });

    describe(".mixin", function() {
      it("adds all the properties in the second module to the first, overwriting any with the same name", function() {
        var a = {
          foo: "foo",
          bar: "bar"
        };

        var b =  {
          bar: "bar2",
          baz: "baz"
        };

        var result = ModuleSystem.mixin(a, b);
        expect(result).to(equal, a);

        expect(a.foo).to(equal, "foo");
        expect(a.bar).to(equal, "bar2");
        expect(a.baz).to(equal, "baz");
      });

      it("mixes eigenprops defined in the second module into eigenprops defined on the first, rather than overwriting them", function() {
        var a = {
          eigenprops: {
            foo: "foo",
            bar: "bar"
          }
        };

        var b =  {
          eigenprops: {
            bar: "bar2",
            baz: "baz"
          }
        };

        ModuleSystem.mixin(a, b);
        expect(a.eigenprops.foo).to(equal, "foo");
        expect(a.eigenprops.bar).to(equal, "bar2");
        expect(a.eigenprops.baz).to(equal, "baz");
      });
    });
  });
}});