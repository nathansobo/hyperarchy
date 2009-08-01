//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Model.Tuple", function() {
    before(function() {
      ModuleSystem.constructor("Animal", Model.Tuple);
    });

    after(function() {
      delete window['Animal'];
    });

    describe("when a subsconstructor is declared", function() {
      it("associates the subconstructor with a Set whose #global_name is the underscored subconstructor name", function() {
        var set = Animal.set;
        expect(set.constructor).to(equal, Model.Relations.Set);
        expect(set.global_name).to(equal, "animals");
      });

      it("automatically gives the subconstructor an 'id' Attribute with a type of 'string'", function() {
        expect(Animal.id).to(be_an_instance_of, Model.Attribute);
        expect(Animal.id.name).to(equal, "id");
        expect(Animal.id.type).to(equal, "string");
      });
    });

    describe("eigenproperties", function() {
      describe(".attribute", function() {
        before(function() {
          Animal.attribute("species_id", "string");
        });

        it("calls #declare_attribute on its #set, assigning the returned attribute to an eigenproperty", function() {
          expect(Animal.species_id).to(equal, Animal.set.attributes_by_name.species_id);
        });

        it("generates a method on .prototype that accesses the field corresponding to the prototype", function() {
          var animal = new Animal();

          var field = animal.fields_by_attribute_name.species_id;
          expect(field.value()).to(be_undefined);
          expect(animal.species_id("dog")).to(equal, "dog");
          expect(field.value()).to(equal, "dog");
          expect(animal.species_id()).to(equal, "dog");
        });
      });

      describe(".attributes", function() {
        it("calls .attribute for every attribute-name/value pair in a given hash", function() {
          mock(Animal, 'attribute');

          Animal.attributes({
            id: "string",
            name: "string"
          });

          expect(Animal.attribute).to(have_been_called, twice);
          expect(Animal.attribute.call_args[0]).to(equal, ['id', 'string']);
          expect(Animal.attribute.call_args[1]).to(equal, ['name', 'string']);
        });
      });

    });

    describe("prototype properties", function() {
      before(function() {
        Animal.attributes({
          name: "string",
          species_id: "string"
        });
      });

      describe("#initialize", function() {
        it("instantiates a Field in #fields_by_attribute_name for each Attribute on the constructor's .set", function() {
          var animal = new Animal();
          
          var name_field = animal.fields_by_attribute_name.name;
          var species_id_field = animal.fields_by_attribute_name.species_id;

          expect(name_field).to(be_an_instance_of, Model.Field);
          expect(name_field.tuple).to(equal, animal);
          expect(name_field.attribute).to(equal, Animal.name);

          expect(species_id_field).to(be_an_instance_of, Model.Field);
          expect(species_id_field.tuple).to(equal, animal);
          expect(species_id_field.attribute).to(equal, Animal.species_id);
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