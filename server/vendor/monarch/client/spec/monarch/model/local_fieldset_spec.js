//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.LocalFieldset", function() {
    use_local_fixtures();

    describe("#dirty_wire_representation", function() {
      it("returns the dirty field values by column name", function() {
        var record = Blog.find('recipes');
        record.name("Booboo");
        record.user_id("farb");


        expect(record.local.dirty_wire_representation()).to(equal, {
          name: 'Booboo',
          user_id: 'farb'
        });
      });
    });

    describe("#wire_representation", function() {
      it("returns all field values by column name", function() {
        var record = Blog.find('recipes');


        expect(record.local.wire_representation()).to(equal, {
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
//      it("instantiates a Field in #fields_by_column_name for each Column on the given tuples's .table", function() {
//        var name_field = fieldset.field('name');
//        var user_id_field = fieldset.field('user_id');
//
//        expect(name_field).to(be_an_instance_of, Monarch.Model.LocalField);
//        expect(name_field.fieldset).to(equal, local);
//        expect(name_field.column).to(equal, Blog.name_);
//
//        expect(user_id_field).to(be_an_instance_of, Monarch.Model.LocalField);
//        expect(user_id_field.fieldset).to(equal, local);
//        expect(user_id_field.column).to(equal, Blog.user_id);
//      });
//    });
//
//    describe("#batch_update_in_progress", function() {
//      it("returns true if a batch update is in progress", function() {
//        expect(fieldset.batch_update_in_progress()).to(be_false);
//        fieldset.begin_batch_update();
//        expect(fieldset.batch_update_in_progress()).to(be_true);
//        fieldset.finish_batch_update();
//        expect(fieldset.batch_update_in_progress()).to(be_false);
//      });
//    });
  });
}});
