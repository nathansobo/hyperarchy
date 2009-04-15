require("/specs/june_spec_helper");

Screw.Unit(function(c) { with(c) {
  describe("Domain", function() {
    describe("#define_set", function() {
      var domain;

      before(function() {
        domain = new June.Domain();
        domain.define_set("Foo", function(c) { with(c) {
          attributes({
            bar: "string",
            baz: "string"
          });
        }});
      });

      after(function() {
        delete window['Foo'];
      });

      it("instantiates a June.Set and assigns it to its #global_name on the Domain", function() {
        expect(domain.foos.constructor).to(equal, June.Relations.Set);
        expect(domain.foos.bar.constructor).to(equal, June.Attribute);
      });

      it("assigns the defined Set to a global name on window", function() {
        expect(Foo).to(equal, domain.foos);
      });

      it("sets #global_name on the defined Set to the underscored and pluralized version of the given name", function() {
        expect(domain.foos.global_name).to(equal, "foos");
      });
    });

    describe("#update", function() {
      var snapshot;
      before(function() {
        snapshot = {
          "users": {
            "bob": {
              "first_name": "Babak"
            },

            "ari": {
              "id": "ari",
              "first_name": "Ari",
              "age": 29
            }
          },

          "pets": {
            "blue": {
              "name": "Red"
            }
          }
        };
      });

      it("calls #update on every Set indicated by the given snapshot with its corresponding snapshot fragment", function() {
        mock(User, 'update');
        mock(Pet, 'update');
        mock(Species, 'update');

        June.GlobalDomain.update(snapshot);

        expect(User.update).to(have_been_called, once);
        expect(User.update).to(have_been_called, with_args(snapshot["users"]));
        expect(Pet.update).to(have_been_called, once);
        expect(Pet.update).to(have_been_called, with_args(snapshot["pets"]));
        expect(Species.update).to_not(have_been_called);
      });

      it("inserts, removes, and updates tuples in every Set before firing any event handlers", function() {
        function assert_all_data_changes_have_been_applied() {
          expect(User.find("dan")).to(be_null);
          expect(User.find("ari")).to_not(be_undefined);
          expect(User.find("bob").first_name()).to(equal, "Babak");
          expect(Pet.find("blue").name()).to(equal, "Red");
        }

        User.on_update(function() {
          assert_all_data_changes_have_been_applied();
        });

        User.on_insert(function() {
          assert_all_data_changes_have_been_applied();
        });
        
        User.on_remove(function() {
          assert_all_data_changes_have_been_applied();
        });

        Pet.on_update(function() {
          assert_all_data_changes_have_been_applied();
        });
        
        June.GlobalDomain.update(snapshot);
      });

      context("when called with a function as its second argument", function() {
        it("calls the function before firing event handlers", function() {
          var insert_handler = mock_function("insert handler");
          var remove_handler = mock_function("remove handler");
          var update_handler = mock_function("update handler");

          var update_callback = mock_function("update callback", function() {
            expect(insert_handler).to_not(have_been_called);
            expect(remove_handler).to_not(have_been_called);
            expect(update_handler).to_not(have_been_called);
          });

          June.GlobalDomain.update(snapshot, update_callback);

          expect(update_callback).to(have_been_called, once);
        });
      });
    });
  });
}});