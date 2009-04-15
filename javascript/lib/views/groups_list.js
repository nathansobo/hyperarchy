module("Views", function(c) { with(c) {
  def("GroupsList", {
    content: function(b) { with(b) {
      ul({'id': "groups_list"});
    }},

    methods: {
      initialize: function() {
        this.remote_domain = June.remote("/domain");
        var self = this;
        this.remote_domain.pull([Group], function() {
          self.render_groups();
        });
      },

      render_groups: function() {
        Group.each(function(group) {
          this.find("#groups_list").append(Disco.build(function(b) { with(b)
            
          }}));
        });
      }
    }
  });
}});