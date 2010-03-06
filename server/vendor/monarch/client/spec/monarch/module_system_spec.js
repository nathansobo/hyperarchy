//= require "../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.ModuleSystem", function() {
    before(function() {
      Monarch.ModuleSystem._disabled_Object = Monarch.ModuleSystem.Object;
      delete Monarch.ModuleSystem.Object;
    });

    after(function() {
      Monarch.ModuleSystem.Object = Monarch.ModuleSystem._disabled_Object;
      delete Monarch.ModuleSystem._disabled_Object;
      delete window.Foo;
    });


    describe(".constructor", function() {
      it("assigns a 'basename' property to the created constructor", function() {
        Monarch.ModuleSystem.constructor("Foo");
        expect(Foo.basename).to(equal, "Foo");
        Monarch.ModuleSystem.constructor("Foo.Bar");
        expect(Foo.Bar.basename).to(equal, "Bar");
      });

      context("when not given a name", function() {
        before(function() {
          Monarch.ModuleSystem.Object = Monarch.ModuleSystem._disabled_Object;
        })

        it("creates an anonymous constructor which inherits from Object, defining the given properties on its prototype", function() {
          var constructor = Monarch.ModuleSystem.constructor({
            foo: "foo",
            bar: "bar"
          });

          expect(constructor.prototype instanceof Monarch.ModuleSystem.Object).to(beTrue);
          expect(constructor.prototype.foo).to(equal, "foo");
          expect(constructor.prototype.bar).to(equal, "bar");
        });
      });

      context("when given a top-level name and a properties hash", function() {
        before(function() {
          Monarch.ModuleSystem.Object = Monarch.ModuleSystem._disabled_Object;
        })

        it("creates a constructor with that name which inherits from Object, defining the given properties on its prototype", function() {
          expect(window['Foo']).to(beUndefined);

          Monarch.ModuleSystem.constructor("Foo", {
            foo: "foo",
            bar: "bar"
          });

          expect(Foo).toNot(beUndefined);
          expect(Foo.prototype instanceof Monarch.ModuleSystem.Object).to(beTrue);
          expect(Foo.prototype.foo).to(equal, "foo");
          expect(Foo.prototype.bar).to(equal, "bar");
        });
      });

      context("when given a qualified name and a properties hash", function() {
        context("when no modules along the given path exist", function() {
          it("creates all modules along the path and creates the constructor at its terminus whose prototype has the given properties", function() {
            expect(window['Foo']).to(beUndefined);

            Monarch.ModuleSystem.constructor("Foo.Bar.Baz", {
              foo: "foo",
              bar: "bar"
            });

            expect(Foo).toNot(beUndefined);
            expect(Foo.Bar).toNot(beUndefined);
            expect(Foo.Bar.Baz).toNot(beUndefined);
            expect(Foo.Bar.Baz.prototype.foo).to(equal, "foo");
            expect(Foo.Bar.Baz.prototype.bar).to(equal, "bar");
          });
        });

        context("when modules along the given path exists, but not the terminus", function() {
          before(function() {
            Monarch.ModuleSystem.module("Foo", {
              foo: "foo"
            });
          });

          it("creates any module that does not yet exist, but leaves existing modules intact", function() {
            Monarch.ModuleSystem.constructor("Foo.Bar.Baz", {
              foo: "foo",
              bar: "bar"
            });

            expect(Foo.foo).toNot(beUndefined);
            expect(Foo.Bar.Baz).toNot(beUndefined);
            expect(Foo.Bar.Baz.prototype.foo).to(equal, "foo");
            expect(Foo.Bar.Baz.prototype.bar).to(equal, "bar");
          });
        });
      });

      context("when given a superconstructor as its second argument", function() {
        before(function() {
          Monarch.ModuleSystem.constructor("Super", {});
        });

        after(function() {
          delete window["Super"];
        });

        it("extends the constructor being defined from the given superconstructor", function() {
          mock(Monarch.ModuleSystem, 'extend');
          Monarch.ModuleSystem.constructor("Foo", Super, {});
          expect(Monarch.ModuleSystem.extend).to(haveBeenCalled, withArgs(Super, Foo));
        });

        context("if .extended is defined as a constructor property on the superconstructor", function() {
          it("it calls the method with the subconstructor after the subconstructor has been fully defined", function() {
            var constructor;
            Super.extended = mockFunction("Super.extended", function() {
              expect(window.Foo).toNot(beUndefined);
              expect(window.Foo.foo).to(equal, "foo");
            });
            constructor = Monarch.ModuleSystem.constructor("Foo", Super, {
              constructorProperties: {
                foo: "foo"
              }
            });
            expect(Super.extended).to(haveBeenCalled, withArgs(Foo));
          });
        });
      });

      context("when given modules as arguments following the name", function() {
        before(function() {
          Monarch.ModuleSystem.module("Bar", { bar: "bar" });
          Monarch.ModuleSystem.module("Baz", { baz: "baz" });
        });

        after(function() {
          delete window["Bar"];
          delete window["Baz"];
        });

        it("mixes the given module into the constructor's prototype", function() {
          mock(Monarch.ModuleSystem, "mixin");

          Monarch.ModuleSystem.constructor("Foo", Bar, Baz, { quux: 'quux' });

          expect(Monarch.ModuleSystem.mixin).to(haveBeenCalled, thrice);
          expect(Monarch.ModuleSystem.mixin.callArgs[0]).to(equal, [Foo.prototype, Bar]);
          expect(Monarch.ModuleSystem.mixin.callArgs[1]).to(equal, [Foo.prototype, Baz]);
        });
      });

      context("when an #initialize method is defined on the prototype", function() {
        before(function() {
          Monarch.ModuleSystem.constructor("Foo", {
            initialize: mockFunction("initialize method")
          });
        });

        it("causes the constructor to invoke #initialize with its arguments", function() {
          new Foo("foo", "bar");
          expect(Foo.prototype.initialize).to(haveBeenCalled, withArgs("foo", "bar"));
        });
      });

      context("when a #constructorInitialize property is defined on the prototype", function() {
        var constructorInitialize;

        before(function() {
          constructorInitialize = mockFunction('constructorInitialize')
          Monarch.ModuleSystem.constructor("Foo", {
            constructorInitialize: constructorInitialize
          });
        });

        it("calls it on the constructor", function() {
          expect(constructorInitialize).to(haveBeenCalled, onObject(Foo));
        });

        it("moves it to the #constructorProperties hash and deletes it from the prototype", function() {
          expect(Foo.prototype.constructorInitialize).to(beUndefined);
          expect(Foo.prototype.constructorProperties.initialize).to(equal, constructorInitialize);
        });
      });

      context("when a #constructorProperties property is defined on the prototype", function() {
        it("defines those properties on the constructor itself", function() {
          Monarch.ModuleSystem.constructor("Foo", {
            constructorProperties: {
              foo: "foo"
            }
          });

          expect(Foo.foo).to(equal, "foo");
        });

        context("when there is an #initialize constructor property", function() {
          it("invokes the initializer after the constructor is fully assembled", function() {
            Monarch.ModuleSystem.constructor("Foo", {
              constructorProperties: {
                initialize: function() {
                  if (!this.prototype.foo) throw new Error("prototype should be assembled");
                  this.eigenInitializeCalled = true;
                }
              },
              
              foo: "foo"
            });

            expect(Foo.eigenInitializeCalled).to(beTrue);
          });
        });
      });

      context("when a #constructorProperties properties are defined on the superconstructor and the mixed-in modules", function() {
        var mixinModule, subconstructorPrototype;

        before(function() {
          Monarch.ModuleSystem.constructor("Super", {
            constructorProperties: {
              foo: "foo super",
              bar: "bar super",
              boing: "boing"
            }
          });

          mixinModule = {
            constructorProperties: {
              bar: "bar module",
              baz: "baz module"
            }
          };

          subconstructorPrototype = {
            constructorProperties: {
              foo: "foo sub",
              baz: "baz sub",
              bop: "bop"
            }
          };

          Monarch.ModuleSystem.constructor("Sub", Super, mixinModule, subconstructorPrototype);
        });

        after(function() {
          delete window['Super'];
          delete window['Sub'];
        });

        it("combines the constructor properties into a 'constructorProperties' hash on the prototype of the defined constructor, giving precmonarchce to modules included later", function() {
          expect(Sub.prototype.constructorProperties).to(equal, {
            foo: "foo sub",
            bar: "bar module",
            baz: "baz sub",
            bop: "bop",
            boing: "boing"
          });
        });

        it("defines the merged constructor properties as properties on the defined constructor itself", function() {
          expect(Sub.foo).to(equal, "foo sub");
          expect(Sub.bar).to(equal, "bar module");
          expect(Sub.baz).to(equal, "baz sub");
          expect(Sub.bop).to(equal, "bop");
          expect(Sub.boing).to(equal, "boing");
        });
        
        it("does not mutate the 'constructorProperties' hashes on the superconstructor or any of the included modules", function() {
          expect(Super.prototype.constructorProperties).to(equal, {
            foo: "foo super",
            bar: "bar super",
            boing: "boing"
          });

          expect(mixinModule.constructorProperties).to(equal, {
            bar: "bar module",
            baz: "baz module"
          });;

          expect(subconstructorPrototype.constructorProperties).to(equal, {
            foo: "foo sub",
            baz: "baz sub",
            bop: "bop"
          });
        });
      });
    });

    describe(".module", function() {
      context("when given a top-level name and a properties hash", function() {
        context("when no module with that name is defined", function() {
          it("defines a new top level module by the given name with the properties", function() {
            expect(window['Foo']).to(beUndefined);
            Monarch.ModuleSystem.module("Foo", {
              foo: "foo",
              bar: "bar"
            });
            expect(Foo).toNot(beUndefined);
            expect(Foo.foo).to(equal, "foo");
            expect(Foo.bar).to(equal, "bar");
          });
        });

        context("when a module with that name is already defined", function() {
          before(function() {
            expect(window['Foo']).to(beUndefined);
            Monarch.ModuleSystem.module("Foo", {
              foo: "foo",
              bar: "bar"
            });
          });

          it("mixes the given properties into the existing module", function() {
            Monarch.ModuleSystem.module("Foo", {
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
            expect(window['Foo']).to(beUndefined);

            Monarch.ModuleSystem.module("Foo.Bar.Baz", {
              foo: "foo",
              bar: "bar"
            });

            expect(Foo).toNot(beUndefined);
            expect(Foo.Bar).toNot(beUndefined);
            expect(Foo.Bar.Baz).toNot(beUndefined);
            expect(Foo.Bar.Baz.foo).to(equal, "foo");
            expect(Foo.Bar.Baz.bar).to(equal, "bar");
          });
        });

        context("when modules along the given path exists, but not the terminus", function() {
          before(function() {
            Monarch.ModuleSystem.module("Foo", {
              foo: "foo"
            });
          });

          it("creates any module that does not yet exist, but leaves existing modules intact", function() {
            Monarch.ModuleSystem.module("Foo.Bar.Baz", {
              foo: "foo",
              bar: "bar"
            });
            
            expect(Foo.foo).toNot(beUndefined);
            expect(Foo.Bar.Baz).toNot(beUndefined);
            expect(Foo.Bar.Baz.foo).to(equal, "foo");
            expect(Foo.Bar.Baz.bar).to(equal, "bar");
          });
        });

        context("when all modules, including the terminus, exist", function() {
          before(function() {
            Monarch.ModuleSystem.module("Foo.Bar.Baz", {
              foo: "foo",
              bar: "bar"
            });
          });

          it("mixes the given properties into the existing modules", function() {
            Monarch.ModuleSystem.module("Foo.Bar.Baz", {
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
        Monarch.ModuleSystem.constructor("Super", {
          constructorProperties: {
            superconstructorProperty: "superconstructorProperty",
            extended: mockFunction()
          },

          initialize: mockFunction(),

          notOverriddenFunction: function() {
            return "notOverriddenFunction";
          },

          overriddenFunction: function() {
            return "overriddenFunction superconstructor version";
          },

          overriddenProperty: "overriddenProperty superconstructor version",
          notOverriddenProperty: "notOverriddenProperty"
        });

        Monarch.ModuleSystem.constructor("Sub", {
          constructorProperties: {
            subconstructorProperty: 'subconstructorProperty'
          },

          overriddenFunction: function() {
            return "overriddenFunction";
          },

          overriddenFunction: function() {
            return "overriddenFunction subconstructor version";
          },

          overriddenProperty: "overriddenProperty subconstructor version",

          subOnlyFunction: function() {
            return "subOnlyFunction";
          },

          subOnlyProperty: "subOnlyProperty"
        });

        Monarch.ModuleSystem.extend(Super, Sub);

        object = new Sub();
      });

      after(function() {
        delete window['Super'];
        delete window['Sub'];
      });

      it("does not invoke the superconstructor's initialize method when creating the prototypical object", function() {
        Super.prototype.initialize.clear();
        Monarch.ModuleSystem.extend(Super, Sub);
        expect(Super.prototype.initialize).toNot(haveBeenCalled);
      });

      describe("functions and properties on the superconstructor prototype that are not overridden in the subconstructor prototype", function() {
        they("are inherited by objects created by the subconstructor", function() {
          expect(object.notOverriddenFunction()).to(equal, "notOverriddenFunction");
          expect(object.notOverriddenProperty).to(equal, "notOverriddenProperty");
        });
      });

      describe("functions and properties on the superconstructor prototype that are overridden in the subconstructor prototype", function() {
        they("are overridden for objects created by the subconstructor", function() {
          expect(object.overriddenFunction()).to(equal, "overriddenFunction subconstructor version");
          expect(object.overriddenProperty).to(equal, "overriddenProperty subconstructor version");
        });
      });

      context("if an 'constructorProperties' property is defined on the superconstructor's prototype", function() {
        it("merges the the constructorProperties of the subconstructor into a copy of those defined on the superconstructor, without mutating the constructorProperties of the superconstructor", function() {
          expect(Sub.prototype.constructorProperties).to(equal, {
            superconstructorProperty: 'superconstructorProperty',
            subconstructorProperty: 'subconstructorProperty',
            extended: Super.extended
          });

          expect(Super.prototype.constructorProperties).to(equal, {
            superconstructorProperty: 'superconstructorProperty',
            extended: Super.extended
          });
        });
      });
    });

    describe(".mixin", function() {
      it("adds all the properties in the second module to the first, overwriting any with the same name, with the exception of the 'constructor' property", function() {
        var a = {
          foo: "foo",
          bar: "bar",
          constructor: '1'
        };

        var b =  {
          bar: "bar2",
          baz: "baz",
          constructor: '2'
        };

        var result = Monarch.ModuleSystem.mixin(a, b);
        expect(result).to(equal, a);

        expect(a.constructor).to(equal, 1);
        expect(a.foo).to(equal, "foo");
        expect(a.bar).to(equal, "bar2");
        expect(a.baz).to(equal, "baz");
      });

      it("mixes constructorProperties defined in the second module into constructorProperties defined on the first, rather than overwriting them", function() {
        var a = {
          constructorProperties: {
            foo: "foo",
            bar: "bar"
          }
        };

        var b =  {
          constructorProperties: {
            bar: "bar2",
            baz: "baz"
          }
        };

        Monarch.ModuleSystem.mixin(a, b);
        expect(a.constructorProperties.foo).to(equal, "foo");
        expect(a.constructorProperties.bar).to(equal, "bar2");
        expect(a.constructorProperties.baz).to(equal, "baz");
      });
    });
  });
}});
