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

//    var record, fieldset;
//    before(function() {
//      record = new Blog();
//      local = new Monarch.Model.LocalFieldset(record);
//    });
//
//    describe("#initialize(record)", function() {
//      it("instantiates a Field in #fieldsByColumnName for each Column on the given tuples's .table", function() {
//        var nameField = fieldset.field('name');
//        var userIdField = fieldset.field('userId');
//
//        expect(nameField).to(beAnInstanceOf, Monarch.Model.LocalField);
//        expect(nameField.fieldset).to(equal, local);
//        expect(nameField.column).to(equal, Blog.name_);
//
//        expect(userIdField).to(beAnInstanceOf, Monarch.Model.LocalField);
//        expect(userIdField.fieldset).to(equal, local);
//        expect(userIdField.column).to(equal, Blog.userId);
//      });
//    });
//
//    describe("#batchUpdateInProgress", function() {
//      it("returns true if a batch update is in progress", function() {
//        expect(fieldset.batchUpdateInProgress()).to(beFalse);
//        fieldset.beginBatchUpdate();
//        expect(fieldset.batchUpdateInProgress()).to(beTrue);
//        fieldset.finishBatchUpdate();
//        expect(fieldset.batchUpdateInProgress()).to(beFalse);
//      });
//    });
  });
}});
