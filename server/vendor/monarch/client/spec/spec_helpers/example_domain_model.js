Screw.Unit(function(c) {
  c.use_example_domain_model = function(between_before_and_after) {
    c.init(function() {
      ModuleSystem.constructor("Blog", Model.Record, {
        constructor_initialize: function() { with(this) {
          columns({
            name: "string",
            user_id: "string"
          });
        }}
      });

      ModuleSystem.constructor("User", Model.Record, {
        constructor_initialize: function() { with(this) {
          columns({
            full_name: "string",
            age: "integer"
          });

          has_many("blogs");

          relates_to_many("blogs2", function() {
            return Blog.where(Blog.user_id.eq(this.id()));
          });
        }}
      });
    });

    if (between_before_and_after) between_before_and_after();

    c.after(function() {
      delete Repository.tables['blogs'];
      delete Repository.tables['users'];
      delete window['Blog'];
      delete window['User'];
    });
  };
});
