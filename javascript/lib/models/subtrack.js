June.define_set("Subtrack", function(c) { with(c) {
  attributes({
    id: "string",
    name: "string",
    answer_mode_timeout: "integer",
    review_mode_timeout: "integer",
    published_at: "datetime",
    deleted_at: "datetime",
    track_id: "string"
  });

  belongs_to("track");
  has_many("question_sets")
}});