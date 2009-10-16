Screw.Unit(function(c) {
  c.use_example_domain_model = function(between_before_and_after) {
    c.init(function() {
      Monarch.ModuleSystem.constructor("Blog", Monarch.Model.Record, {
        constructor_initialize: function() { with(this) {
          columns({
            name: "string",
            user_id: "string",
            started_at: "datetime"
          });

          synthetic_column("fun_profit_name", function() {
            return this.signal('name', function(name) {
              return name + " for Fun and Profit";
            });
          });
        }},

        crazy_name: function(name) {
          this.name("CRAZY " + name);
        }
      });

      Monarch.ModuleSystem.constructor("User", Monarch.Model.Record, {
        constructor_initialize: function() { with(this) {
          columns({
            full_name: "string",
            age: "integer",
            signed_up_at: "datetime"
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
