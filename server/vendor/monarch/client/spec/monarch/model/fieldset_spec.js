//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Model.Fieldset", function() {
    use_example_domain_model();

    var record, fieldset;
    before(function() {
      record = new Blog();
      fieldset = new Model.Fieldset(record);
    });

    describe("#initialize(record)", function() {
      it("instantiates a Field in #fields_by_column_name for each Column on the given Records's .table", function() {
        var name_field = fieldset.field('name');
        var user_id_field = fieldset.field('user_id');

        expect(name_field).to(be_an_instance_of, Model.ConcreteField);
        expect(name_field.fieldset).to(equal, fieldset);
        expect(name_field.column).to(equal, Blog.name);

        expect(user_id_field).to(be_an_instance_of, Model.ConcreteField);
        expect(user_id_field.fieldset).to(equal, fieldset);
        expect(user_id_field.column).to(equal, Blog.user_id);
      });
    });

    describe("#batch_update_in_progress", function() {
      it("returns true if a batch update is in progress", function() {
        expect(fieldset.batch_update_in_progress()).to(be_false);
        fieldset.begin_batch_update();
        expect(fieldset.batch_update_in_progress()).to(be_true);
        fieldset.finish_batch_update();
        expect(fieldset.batch_update_in_progress()).to(be_false);
      });
    });
  });
}});
