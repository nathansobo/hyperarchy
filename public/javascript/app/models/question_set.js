June.define_set("QuestionSet", function(c) { with(c) {
  attributes({
    id: "string",
    name: "string",
    info: "string",
    explanation: "string",
    position: "integer",
    subtrack_id: "string",
    fixed_info_width: "boolean",
    deleted_at: "datetime",
    published_at: "datetime"
  });

  belongs_to("subtrack");
  has_many("questions");
}});