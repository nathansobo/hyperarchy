Screw.Unit(function(c) {
  c.useExampleDomainModel = function(betweenBeforeAndAfter) {
    c.init(function() {
      _.constructor("Blog", Monarch.Model.Record, {
        constructorInitialize: function() {
          this.columns({
            name: "string",
            userId: "key",
            ownerId: "key",
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
          this.belongsTo("user");
        },

        crazyName: function(name) {
          this.name("CRAZY " + name);
        }
      });

      _.constructor("BlogPost", Monarch.Model.Record, {
        constructorInitialize: function() {
          this.columns({
            name: "string",
            blogId: "key",
            body: "string"
          });
        }
      });

      _.constructor("User", Monarch.Model.Record, {
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
