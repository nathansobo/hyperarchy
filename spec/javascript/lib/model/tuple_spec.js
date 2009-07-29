//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Model.Tuple", function() {
    describe("when a subsconstructor is declared", function() {
      after(function() {
        delete window['ProgrammingLanguage'];
      });

      it("associates the subconstructor with a Set whose #global_name is the underscored subconstructor name", function() {
        ModuleSystem.constructor("ProgrammingLanguage", Model.Tuple);
        var set = ProgrammingLanguage.set;
        expect(set.constructor).to(equal, Model.Relations.Set);
        expect(set.global_name).to(equal, "programming_languages");
      });
    });
  });
}});