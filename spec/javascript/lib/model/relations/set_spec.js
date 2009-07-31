//= require "../../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Model.Relations.Set", function() {
    var set;
    before(function() {
      set = new Model.Relations.Set("programming_languages");
    });


    describe("#define_attribute", function() {
      var attribute;
      before(function() {
        attribute = set.define_attribute("family_id", "string");
      });

      it("adds an Attribute with the given name and type to #attributes_by_name and returns it", function() {
        expect(attribute).to(equal, set.attributes_by_name.family_id);
        expect(attribute.constructor).to(equal, Model.Attribute);
        expect(attribute.name).to(equal, 'family_id');
        expect(attribute.type).to(equal, 'string');
      });
    });

    describe("#insert", function() {
      it("adds the given Tuple to the array returned by #all", function() {
        var mock_tuple = {};

        expect(set.all()).to_not(contain, mock_tuple);
        set.insert(mock_tuple)
        expect(set.all()).to(contain, mock_tuple);
      });
    });
  });
}});