//= require "../../eden_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Model.Record", function() {
    define_model_fixtures();

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

    describe("constructor properties", function() {
      describe(".column", function() {
        before(function() {
          delete window['Animal'];
          ModuleSystem.constructor("Animal", Model.Record);
          Animal.column("species_id", "string");
        });

        it("calls #define_column on its #table, assigning the returned Column to a constructor property", function() {
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

      describe(".create", function() {
        context("when Repository.remote_create responds successfully", function() {
          it("calls .local_create with the field values returned by the remote repository and triggers success callbacks with the result", function() {
            var remote_create_future = new AjaxFuture();
            mock(Model.Repository, 'remote_create', function() {
              return remote_create_future;
            });

            var create_future = Animal.create({ name: "Keefa" });
            expect(Model.Repository.remote_create).to(have_been_called, with_args(Animal.table, { name: "Keefa" }));

            var mock_local_create_result = {};
            mock(Animal, 'local_create', function() {
              return mock_local_create_result;
            });
            remote_create_future.trigger_success({id: 'keefa', name: 'Keefa'});

            expect(create_future.successful).to(be_true);
            expect(create_future.data).to(equal, mock_local_create_result);
          });
        });
      });

      describe(".local_create", function() {
        it("builds an instance of the Record with the given field_values and inserts it in .table before returning it", function() {
          mock(Animal.table, 'insert');
          var animal = Animal.local_create({
            id: 'keefa',
            name: 'Keefa'
          });
          expect(Animal.table.insert).to(have_been_called, with_args(animal));
          expect(animal.id()).to(equal, 'keefa');
          expect(animal.name()).to(equal, 'Keefa');
        });
      });
    });

    describe("prototype properties", function() {
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
