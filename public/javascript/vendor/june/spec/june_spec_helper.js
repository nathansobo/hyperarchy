require("/vendor/jquery-1.2.6");
require("/vendor/foundation");
require("/vendor/json");

require("/lib/june/string");
require("/lib/june/subscription_node");
require("/lib/june/subscription_bundle");
require("/lib/june/subscription");
require("/lib/june/domain");
require("/lib/june/remote_domain");
require("/lib/june/tuple_methods");
require("/lib/june/composite_tuple");
require("/lib/june/attribute");
require("/lib/june/field");
require("/lib/june/relations/relation_methods");
require("/lib/june/relations/set");
require("/lib/june/relations/set_configuration");
require("/lib/june/relations/selection");
require("/lib/june/relations/inner_join");
require("/lib/june/relations/set_projection");
require("/lib/june/relations/ordering");
require("/lib/june/predicates/binary_predicate_methods");
require("/lib/june/predicates/predicate_methods");
require("/lib/june/predicates/equal_to");
require("/lib/june/predicates/not_equal_to");
require("/lib/june");

Screw.Unit(function(c) { with(c) {
  before(function() {
    June.define_set("User", function(c) { with(c) {
      attributes({
        'id': 'string',
        'first_name': 'string',
        'age': 'integer',
        'dob': 'datetime'
      });

      relates_to_many("pets", function() {
        return Pet.where(Pet.owner_id.eq(this.id()));
      });

      has_many("pets_2", {target_set_name: "Pet", foreign_key_name: "owner_id"});
      has_one("pet_2", {target_set_name: "Pet", foreign_key_name: "owner_id"});

      relates_to_one("pet", function() {
        return this.pets;
      }),

      methods({
        foo: function() {
          return "foo";
        },

        bar: function() {
          return "bar";
        }
      });
    }});

    June.define_set("Pet", function(c) { with(c) {
      attributes({
        'id': 'string',
        'name': 'string',
        'owner_id': 'string',
        'species_id': 'string'
      });

      belongs_to("species");
      belongs_to("owner", {target_set_name: "User"});
      belongs_to("owner_2", {target_set_name: "User", foreign_key_name: "owner_id"});
    }});

    June.define_set("Species", function(c) { with(c) {
      attributes({
        'id': 'string',
        'name': 'string'
      });

      has_many("pets");
      has_one("pet");
    }});

    User.local_create({id: "alice", first_name: "Alice", age: 22});
    User.local_create({id: "dan", first_name: "Dan", age: 21});
    User.local_create({id: "bob", first_name: "Bob", age: 20});
    User.local_create({id: "joe", first_name: "Joe", age: 19});
    User.local_create({id: "jean", first_name: "Jean", age: 23});

    Pet.local_create({id: "fido", name: "Fido", owner_id: "dan", species_id: "dog"});
    Pet.local_create({id: "cleo", name: "Cleo", owner_id: "dan", species_id: "fish"});
    Pet.local_create({id: "blue", name: "Blue", owner_id: "bob", species_id: "dog"});
    Pet.local_create({id: "stray", name: "Unknown", owner_id: null, species_id: "dog"});

    Species.local_create({id: "dog", name: "Dog"});
    Species.local_create({id: "fish", name: "Fish"});
  });


  after(function() {
    June.GlobalDomain = new June.Domain();
    User = undefined;
    Pet = undefined;
    Species = undefined;
  });
}});


