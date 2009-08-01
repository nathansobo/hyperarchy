//= require "../../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Model.Relations.Table", function() {
    var table;
    before(function() {
      table = new Model.Relations.Table("programming_languages");
    });


    describe("#define_attribute", function() {
      var attribute;
      before(function() {
        attribute = table.define_attribute("family_id", "string");
      });

      it("adds an Attribute with the given name and type to #attributes_by_name and returns it", function() {
        expect(attribute).to(equal, table.attributes_by_name.family_id);
        expect(attribute.constructor).to(equal, Model.Attribute);
        expect(attribute.name).to(equal, 'family_id');
        expect(attribute.type).to(equal, 'string');
      });
    });

    describe("#insert", function() {
      it("adds the given Record to the array returned by #all", function() {
        var mock_record = {};

        expect(table.all()).to_not(contain, mock_record);
        table.insert(mock_record)
        expect(table.all()).to(contain, mock_record);
      });
    });
  });
}});