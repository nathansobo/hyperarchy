June.define_set("Group", function(c) { with(c) {
  attributes({
    id: "string",
    name: "string",
    description: "string"
  });

  has_many("tracks");
}});