//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Tuple", function() {
    use_local_fixtures();
    
    describe("#hash_code()", function() {
      var relation;
      before(function() {
      });

      var a_projection, b_projection;

      before(function() {
        Monarch.ModuleSystem.constructor("A", Monarch.Model.Record);
        A.columns({ a: "string", b: "string", c: "string", d: "string" });
        Monarch.ModuleSystem.constructor("B", Monarch.Model.Record);
        B.columns({ a: "string", b: "string", c: "string", d: "string" });
        A.create({ a: '1', b: '2', c: '3', d: '4' });
        B.create({ a: '1', b: '2', c: '3', d: '4' });

        a_projection = A.project(A.a, A.b, A.d);
        b_projection = B.project(B.a, B.b, B.d);
      });

      after(function() {
        delete window.A;
        delete window.B;
        delete Repository.tables.as;
        delete Repository.tables.bs;
      });

      it("returns an md5 digest of a canonical ordering of its column-value pairs", function() {
        expect(a_projection.first().hash_code()).to(equal, b_projection.first().hash_code());
      });
    });
  });
}});
