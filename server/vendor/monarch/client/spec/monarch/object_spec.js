//= require "../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.ModuleSystem.Object", function() {
    var object;

    before(function() {
      Monarch.ModuleSystem.constructor("Foo");
      Foo.constructorDelegateTarget = {
        foo: mockFunction('constructor foo', function() { return "fooPrime" }),
        bar: mockFunction('constructor bar', function() { return "barPrime" })
      };
    });

    after(function() {
      delete window.Foo;
      delete Monarch.ModuleSystem.Object.constructorDelegateTarget;
    });

    describe(".delegateConstructorMethods", function() {
      it("makes a constructor method that will delegate to a method on another object", function() {
        Foo.delegateConstructorMethods('foo', 'bar', 'constructorDelegateTarget');
        expect(Foo.foo("foo")).to(equal, 'fooPrime');
        expect(Foo.constructorDelegateTarget.foo).to(haveBeenCalled, withArgs('foo'));
        expect(Foo.constructorDelegateTarget.foo).to(haveBeenCalled, onObject(Foo.constructorDelegateTarget));
        expect(Foo.constructorDelegateTarget.bar).toNot(haveBeenCalled);

        expect(Foo.bar("bar")).to(equal, 'barPrime');
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

        expect(object.foo("foo")).to(equal, 'fooPrime');
        expect(object.instanceDelegateTarget.foo).to(haveBeenCalled, withArgs('foo'));
        expect(object.instanceDelegateTarget.foo).to(haveBeenCalled, onObject(object.instanceDelegateTarget));
        expect(object.instanceDelegateTarget.bar).toNot(haveBeenCalled);

        expect(object.bar("bar")).to(equal, 'barPrime');
        expect(object.instanceDelegateTarget.bar).to(haveBeenCalled, withArgs('bar'));
        expect(object.instanceDelegateTarget.bar).to(haveBeenCalled, onObject(object.instanceDelegateTarget));
      });
    });
  });
}});
