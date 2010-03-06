Screw.Unit(function(c) {
  c.useExampleDomainModel = function(betweenBeforeAndAfter) {
    c.init(function() {
      Monarch.ModuleSystem.constructor("Blog", Monarch.Model.Record, {
        constructorInitialize: function() {
          this.columns({
            name: "string",
            userId: "string",
            ownerId: "string",
            startedAt: "datetime"
          });

          this.syntheticColumn("funProfitName", function() {
            return this.signal('name', function(name) {
              return name + " for Fun and Profit";
            });
          });

          this.funProfitName.setter = function(name) {
            this.name(name + " in Bed");
          };

          this.hasMany("blogPosts");
        },

        crazyName: function(name) {
          this.name("CRAZY " + name);
        }
      });

      Monarch.ModuleSystem.constructor("BlogPost", Monarch.Model.Record, {
        constructorInitialize: function() {
          this.columns({
            name: "string",
            blogId: "string",
            body: "string"
          });
        }
      });

      Monarch.ModuleSystem.constructor("User", Monarch.Model.Record, {
        constructorInitialize: function() {
          this.columns({
            fullName: "string",
            age: "integer",
            signedUpAt: "datetime"
          });

          this.hasMany("blogs");

          this.relatesToMany("blogs2", function() {
            return Blog.where(Blog.userId.eq(this.id()));
          });
        }
      });
    });

    if (betweenBeforeAndAfter) betweenBeforeAndAfter();

    c.after(function() {
      Repository.tables = {};
      delete window['Blog'];
      delete window['BlogPost'];
      delete window['User'];
    });
  };
});
