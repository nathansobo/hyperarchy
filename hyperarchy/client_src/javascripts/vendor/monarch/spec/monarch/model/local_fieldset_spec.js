//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.LocalFieldset", function() {
    useLocalFixtures();

    describe("#field(columnOrName)", function() {
      it("returns the field corresponding to the column or name or null if no field is present for the name / column", function() {
        var record = Blog.fixture('recipes');
        expect(record.local.field('id')).toNot(beNull);
        expect(record.local.field('bogus')).to(beNull);
        expect(record.local.field(Blog.id)).toNot(beNull);
        expect(record.local.field(User.id)).to(beNull);
      });
    });

    describe("#dirtyWireRepresentation", function() {
      it("returns the dirty field values by column name, with column names in an underscored format", function() {
        var record = Blog.fixture('recipes');
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
        var record = Blog.fixture('recipes');

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
