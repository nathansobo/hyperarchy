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

    describe(".remote", function() {
      it("builds a new June.RemoteDomain with the given url", function() {
        var remote = June.remote("/domain");
        expect(remote.url).to(equal, "/domain");
      });
    });
    
    describe(".origin", function() {
      it("sets June.Origin to a new RemoteDomain with the given url", function() {
        var origin = June.origin("/domain");
        expect(June.Origin).to(equal, origin);
        expect(origin.constructor).to(equal, June.RemoteDomain);
        expect(origin.url).to(equal, "/domain");
      });
    });

    describe(".pull", function() {
      it("delegates to June.Origin.pull", function() {
        mock(June.Origin, "pull");

        var pull_callback = function() {};
        June.pull([Pet], pull_callback);

        expect(June.Origin.pull).to(have_been_called, with_args([Pet], pull_callback));
      });
    });
    
    describe(".each", function() {
      it("iterates over an array, yielding each element to a function as the value of 'this' and as the argument", function() {
        var array = [1, 2, 3];
        var this_values = [];
        var arg_values = [];

        June.each(array, function(x) {
          this_values.push(this);
          arg_values.push(this);
        });

        expect(this_values).to(equal, array);
        expect(arg_values).to(equal, array);
      });
    });

    describe(".map", function() {
      it("maps over an array, yielding each element to a function as the value of 'this' and as the argument", function() {
        var array = [1, 2, 3];
        var this_values = [];
        var arg_values = [];

        expect(June.map(array, function() {
          return this + 1;
        })).to(equal, [2, 3, 4]);

        expect(June.map(array, function(x) {
          return x + 1;
        })).to(equal, [2, 3, 4]);
      });
    });



  });
}});