//= require "../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("The foundation.js extensions to underscore.js", function() {
    var rootObject;

    function disableRootObject() {
      rootObject = _.Object;
      delete _.Object;
    }

    function enableRootObject() {
      _.Object = rootObject;
    }

    init(function() {
      disableRootObject();
    });

    after(function() {
      enableRootObject();
      delete window.Foo;
    });

    describe("_.constructor(optionalQualifiedName, superconstructorOrMixins...)", function() {
      it("assigns a 'basename' property to the created constructor", function() {
        _.constructor("Foo");
        expect(Foo.basename).to(eq, "Foo");
        _.constructor("Foo.Bar");
        expect(Foo.Bar.basename).to(eq, "Bar");
      });

      context("when not given a name", function() {
        before(function() {
          enableRootObject();
        })

        it("creates an anonymous constructor which inherits from Object, defining the given properties on its prototype", function() {
          var constructor = _.constructor({
            foo: "foo",
            bar: "bar"
          });

          expect(constructor.prototype instanceof _.Object).to(beTrue);
          expect(constructor.prototype.foo).to(eq, "foo");
          expect(constructor.prototype.bar).to(eq, "bar");
        });
      });

      context("when given a top-level name and a properties hash", function() {
        before(function() {
          enableRootObject();
        });

        it("creates a constructor with that name which inherits from Object, defining the given properties on its prototype", function() {
          expect(window.Foo).to(beUndefined);

          _.constructor("Foo", {
            foo: "foo",
            bar: "bar"
          });

          expect(Foo).toNot(beUndefined);
          expect(Foo.prototype instanceof _.Object).to(beTrue);
          expect(Foo.prototype.foo).to(eq, "foo");
          expect(Foo.prototype.bar).to(eq, "bar");
        });
      });

      context("when given a qualified name and a properties hash", function() {
        context("when no modules along the given path exist", function() {
          it("creates all modules along the path and creates the constructor at its terminus whose prototype has the given properties", function() {
            expect(window.Foo).to(beUndefined);

            _.constructor("Foo.Bar.Baz", {
              foo: "foo",
              bar: "bar"
            });

            expect(Foo).toNot(beUndefined);
            expect(Foo.Bar).toNot(beUndefined);
            expect(Foo.Bar.Baz).toNot(beUndefined);
            expect(Foo.Bar.Baz.prototype.foo).to(eq, "foo");
            expect(Foo.Bar.Baz.prototype.bar).to(eq, "bar");
          });
        });

        context("when modules along the given path exists, except for the terminus", function() {
          before(function() {
            _.module("Foo", {
              foo: "foo"
            });
          });

          it("creates any module that does not yet exist, but leaves existing modules intact", function() {
            _.constructor("Foo.Bar.Baz", {
              foo: "foo",
              bar: "bar"
            });

            expect(Foo.foo).toNot(beUndefined);
            expect(Foo.Bar.Baz).toNot(beUndefined);
            expect(Foo.Bar.Baz.prototype.foo).to(eq, "foo");
            expect(Foo.Bar.Baz.prototype.bar).to(eq, "bar");
          });
        });
      });

      context("when given a superconstructor as its second argument", function() {
        before(function() {
          _.constructor("Super", {});
        });

        after(function() {
          delete window.Super;
        });

        it("extends the constructor being defined from the given superconstructor", function() {
          mock(_, 'inherit');
          _.constructor("Foo", Super, {});
          expect(_.inherit).to(haveBeenCalled, withArgs(Super, Foo));
        });

        context("if .inherited is defined as a constructor property on the superconstructor", function() {
          it("it calls the method with the subconstructor after the subconstructor has been fully defined", function() {
            var constructor;
            Super.inherited = mockFunction("Super.inherited", function() {
              expect(window.Foo).toNot(beUndefined);
              expect(window.Foo.foo).to(eq, "foo");
            });
            constructor = _.constructor("Foo", Super, {
              constructorProperties: {
                foo: "foo"
              }
            });
            expect(Super.inherited).to(haveBeenCalled, withArgs(Foo));
          });
        });
      });

      context("when given modules as arguments following the name", function() {
        before(function() {
          _.module("Bar", { bar: "bar" });
          _.module("Baz", { baz: "baz" });
        });

        after(function() {
          delete window.Bar;
          delete window.Baz;
        });

        it("adds methods to the constructor's prototype from the given modules", function() {
          mock(_, "addMethods");
          
          _.constructor("Foo", Bar, Baz, { quux: 'quux' });

          expect(_.addMethods).to(haveBeenCalled, thrice);
          expect(_.addMethods.callArgs[0]).to(equal, [Foo.prototype, Bar]);
          expect(_.addMethods.callArgs[1]).to(equal, [Foo.prototype, Baz]);
          expect(_.addMethods.callArgs[2]).to(equal, [Foo.prototype, { quux: 'quux' }]);
        });
      });

      context("when an #initialize method is defined on the prototype", function() {
        before(function() {
          _.constructor("Foo", {
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
          _.constructor("Foo", {
            constructorInitialize: constructorInitialize
          });
        });

        it("calls it on the constructor", function() {
          expect(constructorInitialize).to(haveBeenCalled, onObject(Foo));
        });

        it("moves it to the #constructorProperties hash and deletes it from the prototype", function() {
          expect(Foo.prototype.constructorInitialize).to(beUndefined);
          expect(Foo.prototype.constructorProperties.initialize).to(eq, constructorInitialize);
        });
      });

      context("when a #constructorProperties property is defined on the prototype", function() {
        it("defines those properties on the constructor itself", function() {
          _.constructor("Foo", {
            constructorProperties: {
              foo: "foo"
            }
          });

          expect(Foo.foo).to(eq, "foo");
        });

        context("when there is an #initialize constructor property", function() {
          it("invokes the initializer after the constructor is fully assembled", function() {
            _.constructor("Foo", {
              constructorProperties: {
                initialize: mockFunction("constructor initialize", function() {
                  if (!this.prototype.foo) throw new Error("prototype should be assembled");
                })
              },
              
              foo: "foo"
            });

            expect(Foo.initialize).to(haveBeenCalled);
          });
        });
      });

      context("when #constructorProperties properties are also defined on the superconstructor and the mixed-in modules", function() {
        var mixinModule, subconstructorPrototype;

        before(function() {
          _.constructor("Super", {
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

          _.constructor("Sub", Super, mixinModule, subconstructorPrototype);
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
          expect(Sub.foo).to(eq, "foo sub");
          expect(Sub.bar).to(eq, "bar module");
          expect(Sub.baz).to(eq, "baz sub");
          expect(Sub.bop).to(eq, "bop");
          expect(Sub.boing).to(eq, "boing");
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

    describe("_.module(name, propertiesHash)", function() {
      context("when given a top-level name and a properties hash", function() {
        context("when no module with that name is defined", function() {
          it("defines a new top level module by the given name with the properties", function() {
            expect(window.Foo).to(beUndefined);
            _.module("Foo", {
              foo: "foo",
              bar: "bar"
            });
            expect(Foo).toNot(beUndefined);
            expect(Foo.foo).to(eq, "foo");
            expect(Foo.bar).to(eq, "bar");
          });
        });

        context("when a module with that name is already defined", function() {
          before(function() {
            expect(window['Foo']).to(beUndefined);
            _.module("Foo", {
              foo: "foo",
              bar: "bar"
            });
          });

          it("adds methods from the given hash to the existing module", function() {
            mockProxy(_, 'addMethods');
            var newPropertiesHash = {
              bar: "bar2",
              baz: "baz"
            };
            _.module("Foo", newPropertiesHash);

            expect(_.addMethods).to(haveBeenCalled, withArgs(Foo, newPropertiesHash));
            expect(Foo.foo).to(eq, "foo");
            expect(Foo.bar).to(eq, "bar2");
            expect(Foo.baz).to(eq, "baz");
          });
        });
      });

      context("when given a qualified module name and a properties hash", function() {
        context("when no modules along the given path exist", function() {
          it("creates all modules along the path and installs the properties at its terminus", function() {
            expect(window.Foo).to(beUndefined);

            _.module("Foo.Bar.Baz", {
              foo: "foo",
              bar: "bar"
            });

            expect(Foo).toNot(beUndefined);
            expect(Foo.Bar).toNot(beUndefined);
            expect(Foo.Bar.Baz).toNot(beUndefined);
            expect(Foo.Bar.Baz.foo).to(eq, "foo");
            expect(Foo.Bar.Baz.bar).to(eq, "bar");
          });
        });

        context("when modules along the given path exists, but not the terminus", function() {
          before(function() {
            _.module("Foo", {
              foo: "foo"
            });
          });

          it("creates any module that does not yet exist, but leaves existing modules intact", function() {
            _.module("Foo.Bar.Baz", {
              foo: "foo",
              bar: "bar"
            });
            
            expect(Foo.foo).toNot(beUndefined);
            expect(Foo.Bar.Baz).toNot(beUndefined);
            expect(Foo.Bar.Baz.foo).to(eq, "foo");
            expect(Foo.Bar.Baz.bar).to(eq, "bar");
          });
        });

        context("when all modules, including the terminus, exist", function() {
          before(function() {
            _.module("Foo.Bar.Baz", {
              foo: "foo",
              bar: "bar"
            });
          });

          it("adds methods from the given hash to the existing module", function() {
            mockProxy(_, 'addMethods');
            var newPropertiesHash = {
              bar: "bar2",
              baz: "baz"
            };
            _.module("Foo.Bar.Baz", newPropertiesHash);

            expect(_.addMethods).to(haveBeenCalled, withArgs(Foo.Bar.Baz, newPropertiesHash));
            expect(Foo.Bar.Baz.foo).to(eq, "foo");
            expect(Foo.Bar.Baz.bar).to(eq, "bar2");
            expect(Foo.Bar.Baz.baz).to(eq, "baz");
          });
        });
      });
    });

    describe("_.inherit(Superconstrucor, Subsconstructor)", function() {
      var object;

      before(function() {
        _.constructor("Super", {
          constructorProperties: {
            superconstructorProperty: "superconstructorProperty",
            inherited: mockFunction()
          },

          initialize: mockFunction('superconstructor initialize'),

          notOverriddenFunction: function() {
            return "notOverriddenFunction";
          },

          overriddenFunction: function() {
            return "overriddenFunction superconstructor version";
          },

          superTest: mockFunction("superTest", function() {
            return "superTest return value";
          }),

          overriddenProperty: "overriddenProperty superconstructor version",
          notOverriddenProperty: "notOverriddenProperty"
        });

        _.constructor("Sub", {
          constructorProperties: {
            subconstructorProperty: 'subconstructorProperty'
          },

          overriddenFunction: function() {
            return "overriddenFunction";
          },

          overriddenFunction: function() {
            return "overriddenFunction subconstructor version";
          },

          superTest: function($super, arg1, arg2) {
            return $super(arg1, arg2);
          },

          overriddenProperty: "overriddenProperty subconstructor version",

          subOnlyFunction: function() {
            return "subOnlyFunction";
          },

          subOnlyProperty: "subOnlyProperty"
        });

        _.inherit(Super, Sub);

        object = new Sub();
      });

      after(function() {
        delete window.Super;
        delete window.Sub;
      });

      it("does not invoke the superconstructor's initialize method when creating the prototypical object", function() {
        Super.prototype.initialize.clear();
        _.extend(Super, Sub);
        expect(Super.prototype.initialize).toNot(haveBeenCalled);
      });

      describe("functions and properties on the superconstructor prototype that are not overridden in the subconstructor prototype", function() {
        they("are inherited by objects created by the subconstructor", function() {
          expect(object.notOverriddenFunction()).to(eq, "notOverriddenFunction");
          expect(object.notOverriddenProperty).to(eq, "notOverriddenProperty");
        });
      });

      describe("functions and properties on the superconstructor prototype that are overridden in the subconstructor prototype", function() {
        they("are overridden for objects created by the subconstructor", function() {
          expect(object.overriddenFunction()).to(eq, "overriddenFunction subconstructor version");
          expect(object.overriddenProperty).to(eq, "overriddenProperty subconstructor version");
        });

        they("can be invoked by calling this.ancestor(optionalDifferentArguments) within the overriding function", function() {
          expect(object.superTest("foo", "bar")).to(eq, "superTest return value");
          expect(Super.prototype.superTest).to(haveBeenCalled, withArgs("foo", "bar"));
        });
      });

      context("if an 'constructorProperties' property is defined on the superconstructor's prototype", function() {
        it("merges the the constructorProperties of the subconstructor into a copy of those defined on the superconstructor, without mutating the constructorProperties of the superconstructor", function() {
          expect(Sub.prototype.constructorProperties).to(equal, {
            superconstructorProperty: 'superconstructorProperty',
            subconstructorProperty: 'subconstructorProperty',
            inherited: Super.inherited
          });

          expect(Super.prototype.constructorProperties).to(equal, {
            superconstructorProperty: 'superconstructorProperty',
            inherited: Super.inherited
          });
        });
      });
    });

    describe(".addMethods(targetModule, sourceModule)", function() {
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

        var result = _.addMethods(a, b);
        expect(result).to(eq, a);

        expect(a.constructor).to(eq, '1');
        expect(a.foo).to(eq, "foo");
        expect(a.bar).to(eq, "bar2");
        expect(a.baz).to(eq, "baz");
      });

      it("extends constructorProperties on the target module with constructorProperties defined on the source module, rather than overwriting the constructor properties hash entirely", function() {
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

        _.addMethods(a, b);
        expect(a.constructorProperties.foo).to(eq, "foo");
        expect(a.constructorProperties.bar).to(eq, "bar2");
        expect(a.constructorProperties.baz).to(eq, "baz");
      });

      describe("handling of declarative reader/writer pairs", function() {
        context("when automatic reader/writer pairs are declared", function() {
          it("defines jQuery style reader/writer functions for them in the target module", function() {
            var a = {};
            var b = {
              propertyAccessors: ["foo", "bar"]
            };

            _.addMethods(a, b);

            expect(a.foo._accessor_).to(beTrue);
            expect(a.bar._accessor_).to(beTrue);

            expect(a.foo("foo1")).to(eq, "foo1");
            expect(a.foo()).to(eq, "foo1");
            expect(a._foo).to(eq, "foo1");

            expect(a.foo("foo2")).to(eq, "foo2");
            expect(a.foo()).to(eq, "foo2");
            expect(a._foo).to(eq, "foo2");

            expect(a.bar("bar1")).to(eq, "bar1");
            expect(a.bar()).to(eq, "bar1");
            expect(a._bar).to(eq, "bar1");
          });
        });

        context("when custom readers, writers or hooks are requested", function() {
          it("defines jQuery style reader/writer functions in the target module that dispatch to the custom handlers and call the appropriate hooks", function() {
            var quuxAfterWriteHook = mockFunction("quuxAfterWriteHook");
            var quuxAfterChangeHook = mockFunction("quuxAfterChangeHook");
            var definedTwiceWriteHook = mockFunction("doubleDefinedWriteHook");
            var a = {};
            var b = {
              propertyAccessors: ["definedTwice"],

              foo: {
                reader: function() {
                  return "custom foo reader: " + this._foo;
                },

                writer: function(x) {
                  this._foo = "custom foo writer: " + x;
                }
              },

              bar: {
                writer: function(x) {
                  this._bar = "custom bar writer: " + x;
                  return "custom writer return value";
                }
              },

              baz: {
                reader: function() {
                  return "custom baz reader: " + this._baz;
                }
              },

              quux: {
                afterWrite: quuxAfterWriteHook,
                afterChange: quuxAfterChangeHook
              },

              emptyHash: {},
              emptyArray: [],

              definedTwice: {
                afterWrite: definedTwiceWriteHook
              }
            };

            _.addMethods(a, b);

            expect(a.foo._accessor_).to(beTrue);
            expect(a.foo("a")).to(equal, "custom foo writer: a");
            expect(a.foo()).to(equal, "custom foo reader: custom foo writer: a");

            expect(a.bar._accessor_).to(beTrue);
            expect(a.bar("b")).to(equal, "custom writer return value");
            expect(a.bar()).to(equal, "custom bar writer: b");

            expect(a.baz._accessor_).to(beTrue);
            expect(a.baz("c")).to(equal, "c");
            expect(a.baz()).to(equal, "custom baz reader: c");

            expect(a.quux._accessor_).to(beTrue);
            a.quux("d");
            expect(quuxAfterWriteHook).to(haveBeenCalled, withArgs("d", undefined));
            expect(quuxAfterChangeHook).to(haveBeenCalled, withArgs("d", undefined));
            a.quux("e");
            expect(quuxAfterWriteHook).to(haveBeenCalled, withArgs("e", "d"));
            expect(quuxAfterChangeHook).to(haveBeenCalled, withArgs("e", "d"));
            quuxAfterChangeHook.clear();
            
            a.quux("e");
            expect(quuxAfterWriteHook).to(haveBeenCalled, withArgs("e", "e"));
            expect(quuxAfterChangeHook).toNot(haveBeenCalled);

            expect(a.emptyHash).to(equal, {});
            expect(a.emptyArray).to(equal, []);
            
            a.definedTwice("hello");
            expect(definedTwiceWriteHook).to(haveBeenCalled, withArgs("hello", undefined));
          });
        });

        context("when a chain of methods all invoke super", function() {
          it("invokes the methods in the reverse order they were overridden", function() {
            var calls, a, b, c;

            calls = [];

            a = {
              foo: function() {
                calls.push("foo 1");
              }
            };

            b = {
              foo: function($super) {
                calls.push("foo 2");
                $super();
              }
            };

            c = {
              foo: function($super) {
                calls.push("foo 3");
                $super();
              }
            };

            var x = {};
            _.addMethods(x, a);
            _.addMethods(x, b);
            _.addMethods(x, c);
            x.foo();
            expect(calls).to(equal, ["foo 3", "foo 2", "foo 1"]);

            calls = [];
            
            var y = {}
            _.addMethods(y, a);
            _.addMethods(y, c);
            _.addMethods(y, b);
            y.foo();
            expect(calls).to(equal, ["foo 2", "foo 3", "foo 1"]);
          });
        });
      });
    });
  });

  describe("_.Object", function() {
    var object;

    before(function() {
      _.constructor("Foo");
      Foo.constructorDelegateTarget = {
        foo: mockFunction('constructor foo', function() { return "fooPrime" }),
        bar: mockFunction('constructor bar', function() { return "barPrime" })
      };
    });

    after(function() {
      delete window.Foo;
      delete _.Object.constructorDelegateTarget;
    });

    describe(".delegateConstructorMethods", function() {
      it("makes a constructor method that will delegate to a method on another object", function() {
        Foo.delegateConstructorMethods('foo', 'bar', 'constructorDelegateTarget');
        expect(Foo.foo("foo")).to(eq, 'fooPrime');
        expect(Foo.constructorDelegateTarget.foo).to(haveBeenCalled, withArgs('foo'));
        expect(Foo.constructorDelegateTarget.foo).to(haveBeenCalled, onObject(Foo.constructorDelegateTarget));
        expect(Foo.constructorDelegateTarget.bar).toNot(haveBeenCalled);

        expect(Foo.bar("bar")).to(eq, 'barPrime');
        expect(Foo.constructorDelegateTarget.bar).to(haveBeenCalled, withArgs('bar'));
        expect(Foo.constructorDelegateTarget.bar).to(haveBeenCalled, onObject(Foo.constructorDelegateTarget));
      });
    });

    describe(".delegate", function() {
      it("makes a method that will delegate to a method on another object", function() {
        Foo.delegate('foo', 'bar', 'instanceDelegateTarget');
        object = new Foo();
        object.instanceDelegateTarget = {
          foo: mockFunction('constructor foo', function() { return "fooPrime" }),
          bar: mockFunction('constructor bar', function() { return "barPrime" })
        }

        expect(object.foo("foo")).to(eq, 'fooPrime');
        expect(object.instanceDelegateTarget.foo).to(haveBeenCalled, withArgs('foo'));
        expect(object.instanceDelegateTarget.foo).to(haveBeenCalled, onObject(object.instanceDelegateTarget));
        expect(object.instanceDelegateTarget.bar).toNot(haveBeenCalled);

        expect(object.bar("bar")).to(eq, 'barPrime');
        expect(object.instanceDelegateTarget.bar).to(haveBeenCalled, withArgs('bar'));
        expect(object.instanceDelegateTarget.bar).to(haveBeenCalled, onObject(object.instanceDelegateTarget));
      });
    });
  });
}});
