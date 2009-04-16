June.define_set("Question", function(c) { with(c) {
  attributes({
    id: "string",
    stimulus: "string",
    position: "integer",
    supporting_statements: "string",
    image: "string",
    question_set_id: "string",
    explanation: "string",
    name: "string",
    source_info: "string",
    experience_points: "integer",
    deleted_at: "datetime",
    published_at: "datetime",
    spr: "boolean"
  });

  belongs_to("question_set");
}});