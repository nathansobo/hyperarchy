//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Tuple", function() {
    useLocalFixtures();
    
    describe("#hashCode()", function() {
      var relation;
      before(function() {
      });

      var aProjection, bProjection;

      before(function() {
        Monarch.ModuleSystem.constructor("A", Monarch.Model.Record);
        A.columns({ a: "string", b: "string", c: "string", d: "string" });
        Monarch.ModuleSystem.constructor("B", Monarch.Model.Record);
        B.columns({ a: "string", b: "string", c: "string", d: "string" });
        A.create({ a: '1', b: '2', c: '3', d: '4' });
        B.create({ a: '1', b: '2', c: '3', d: '4' });

        aProjection = A.project(A.a, A.b, A.d);
        bProjection = B.project(B.a, B.b, B.d);
      });

      after(function() {
        delete window.A;
        delete window.B;
        delete Repository.tables.as;
        delete Repository.tables.bs;
      });

      it("returns an md5 digest of a canonical ordering of its column-value pairs", function() {
        expect(aProjection.first().hashCode()).to(equal, bProjection.first().hashCode());
      });
    });
  });
}});
