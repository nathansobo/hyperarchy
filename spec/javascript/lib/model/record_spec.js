//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Model.Record", function() {
    before(function() {
      ModuleSystem.constructor("Animal", Model.Record);
    });

    after(function() {
      delete window['Animal'];
    });

    describe("when a subsconstructor is declared", function() {
      it("associates the subconstructor with a Table whose #global_name is the underscored subconstructor name", function() {
        var table = Animal.table;
        expect(table.constructor).to(equal, Model.Relations.Table);
        expect(table.global_name).to(equal, "animals");
      });

      it("automatically gives the subconstructor an 'id' Column with a type of 'string'", function() {
        expect(Animal.id).to(be_an_instance_of, Model.Column);
        expect(Animal.id.name).to(equal, "id");
        expect(Animal.id.type).to(equal, "string");
      });
    });

    describe("eigenproperties", function() {
      describe(".column", function() {
        before(function() {
          Animal.column("species_id", "string");
        });

        it("calls #define_column on its #table, assigning the returned Column to an eigenproperty", function() {
          expect(Animal.species_id).to(equal, Animal.table.columns_by_name.species_id);
        });

        it("generates a method on .prototype that accesses the field corresponding to the prototype", function() {
          var animal = new Animal();

          var field = animal.fields_by_column_name.species_id;
          expect(field.value()).to(be_undefined);
          expect(animal.species_id("dog")).to(equal, "dog");
          expect(field.value()).to(equal, "dog");
          expect(animal.species_id()).to(equal, "dog");
        });
      });

      describe(".columns", function() {
        it("calls .column for every column-name/value pair in the given hash", function() {
          mock(Animal, 'column');

          Animal.columns({
            id: "string",
            name: "string"
          });

          expect(Animal.column).to(have_been_called, twice);
          expect(Animal.column.call_args[0]).to(equal, ['id', 'string']);
          expect(Animal.column.call_args[1]).to(equal, ['name', 'string']);
        });
      });
    });

    describe("prototype properties", function() {
      before(function() {
        Animal.columns({
          name: "string",
          species_id: "string"
        });
      });

      describe("#initialize", function() {
        it("instantiates a Field in #fields_by_column_name for each Column on the constructor's .table", function() {
          var animal = new Animal();
          
          var name_field = animal.fields_by_column_name.name;
          var species_id_field = animal.fields_by_column_name.species_id;

          expect(name_field).to(be_an_instance_of, Model.Field);
          expect(name_field.record).to(equal, animal);
          expect(name_field.column).to(equal, Animal.name);

          expect(species_id_field).to(be_an_instance_of, Model.Field);
          expect(species_id_field.record).to(equal, animal);
          expect(species_id_field.column).to(equal, Animal.species_id);
        });

        it("assigns the given field values to their respective Fields", function() {
          var animal = new Animal({
            id: "keefa",
            name: "Keefa"
          });

          expect(animal.id()).to(equal, "keefa");
          expect(animal.name()).to(equal, "Keefa");
        });
      });
    });
  });
}});