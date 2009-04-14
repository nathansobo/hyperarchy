//require("/vendor/jquery-1.2.6");
require("/vendor/foundation");
require("/june");
require("/june/string");
require("/june/subscription_node");
require("/june/subscription");
require("/june/relation_methods");
require("/june/subscriber_methods");
require("/june/subscribable");
require("/june/tuple_supervisor");
require("/june/tuple_methods");
require("/june/domain");
require("/june/set");
require("/june/inner_join");
require("/june/selection");
require("/june/composite_tuple");
require("/june/set_configuration");
require("/june/attribute");
require("/june/field");
require("/june/set_projection");
require("/june/predicates/predicate_methods");
require("/june/predicates/equal_to");
require("/june/predicates/not_equal_to");

Screw.Unit(function(c) { with(c) {
  before(function() {
    FixtureDomain = new June.Domain();

    FixtureDomain.define_set("User", function(c) { with(c) {
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
        return this.pets_relation;
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

    FixtureDomain.define_set("Pet", function(c) { with(c) {
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

    FixtureDomain.define_set("Species", function(c) { with(c) {
      attributes({
        'id': 'string',
        'name': 'string'
      });

      has_many("pets");
      has_one("pet");
    }});

    User.create({id: "dan", first_name: "Dan", age: 21});
    User.create({id: "bob", first_name: "Bob", age: 21});
    User.create({id: "joe", first_name: "Joe", age: 21});
    User.create({id: "alice", first_name: "Alice", age: 22});
    User.create({id: "jean", first_name: "Jean", age: 22});

    Pet.create({id: "fido", name: "Fido", owner_id: "dan", species_id: "dog"});
    Pet.create({id: "cleo", name: "Cleo", owner_id: "dan", species_id: "fish"});
    Pet.create({id: "blue", name: "Blue", owner_id: "bob", species_id: "dog"});
    Pet.create({id: "stray", name: "Unknown", owner_id: null, species_id: "dog"});

    Species.create({id: "dog", name: "Dog"});
    Species.create({id: "fish", name: "Fish"});
  });


  after(function() {
    FixtureDomain = undefined;
    User = undefined;
    Pet = undefined;
    Species = undefined;
  });
}});


