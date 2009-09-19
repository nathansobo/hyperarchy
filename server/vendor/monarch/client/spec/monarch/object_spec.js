//= require "../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("ModuleSystem.Object", function() {
    var object;

    before(function() {
      ModuleSystem.constructor("Foo");
      Foo.constructor_delegate_target = {
        foo: mock_function('constructor foo', function() { return "foo_prime" }),
        bar: mock_function('constructor bar', function() { return "bar_prime" })
      };
    });

    after(function() {
      delete ModuleSystem.Object.constructor_delegate_target;
    });

    describe(".delegate_constructor_methods", function() {
      it("makes a constructor method that will delegate to a method on another object", function() {
        Foo.delegate_constructor_methods('foo', 'bar', 'constructor_delegate_target');
        expect(Foo.foo("foo")).to(equal, 'foo_prime');
        expect(Foo.constructor_delegate_target.foo).to(have_been_called, with_args('foo'));
        expect(Foo.constructor_delegate_target.foo).to(have_been_called, on_object(Foo.constructor_delegate_target));
        expect(Foo.constructor_delegate_target.bar).to_not(have_been_called);

        expect(Foo.bar("bar")).to(equal, 'bar_prime');
        expect(Foo.constructor_delegate_target.bar).to(have_been_called, with_args('bar'));
        expect(Foo.constructor_delegate_target.bar).to(have_been_called, on_object(Foo.constructor_delegate_target));
      });
    });

    describe(".delegate", function() {
      it("makes a method that will delegate to a method on another object", function() {
        Foo.delegate('foo', 'bar', 'instance_delegate_target');
        object = new Foo();
        object.instance_delegate_target = {
          foo: mock_function('constructor foo', function() { return "foo_prime" }),
          bar: mock_function('constructor bar', function() { return "bar_prime" })
        }

        expect(object.foo("foo")).to(equal, 'foo_prime');
        expect(object.instance_delegate_target.foo).to(have_been_called, with_args('foo'));
        expect(object.instance_delegate_target.foo).to(have_been_called, on_object(object.instance_delegate_target));
        expect(object.instance_delegate_target.bar).to_not(have_been_called);

        expect(object.bar("bar")).to(equal, 'bar_prime');
        expect(object.instance_delegate_target.bar).to(have_been_called, with_args('bar'));
        expect(object.instance_delegate_target.bar).to(have_been_called, on_object(object.instance_delegate_target));
      });
    });
  });
}});
