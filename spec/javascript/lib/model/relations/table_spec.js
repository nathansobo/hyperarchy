//= require "../../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Model.Relations.Table", function() {
    var table;
    before(function() {
      table = new Model.Relations.Table("programming_languages");
    });


    describe("#define_column", function() {
      var column;
      before(function() {
        column = table.define_column("family_id", "string");
      });

      it("adds an Column with the given name and type to #columns_by_name and returns it", function() {
        expect(column).to(equal, table.columns_by_name.family_id);
        expect(column.constructor).to(equal, Model.Column);
        expect(column.name).to(equal, 'family_id');
        expect(column.type).to(equal, 'string');
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

    describe("#wire_representation", function() {
      it("contains the Table's #name and has the 'type' of 'table'", function() {
        expect(table.wire_representation()).to(equal, {
          type: "table",
          name: "programming_languages"
        });
      });
    });
  });
}});