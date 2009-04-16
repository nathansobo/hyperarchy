June.define_set("Track", function(c) { with(c) {
  attributes({
    id: "string",
    name: "string",
    group_id: "string",
    maximum_users: "integer",
    published_at: "datetime",
    deleted_at: "datetime"
  });

  belongs_to("group");
  has_many("subtracks");
}});