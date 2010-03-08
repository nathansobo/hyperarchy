//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.LocalFieldset", function() {
    useLocalFixtures();

    describe("#dirtyWireRepresentation", function() {
      it("returns the dirty field values by column name, with column names in an underscored format", function() {
        var record = Blog.find('recipes');
        record.name("Booboo");
        record.userId("farb");


        expect(record.local.dirtyWireRepresentation()).to(equal, {
          name: 'Booboo',
          user_id: 'farb'
        });
      });
    });

    describe("#wireRepresentation", function() {
      it("returns all field values by column name, with column names in an underscored format", function() {
        var record = Blog.find('recipes');

        expect(record.local.wireRepresentation()).to(equal, {
          id: 'recipes',
          name: 'Recipes from the Front',
          user_id: 'mike',
          started_at: 1253742029201,
          owner_id: undefined
        });
      });
    });
  });
}});
