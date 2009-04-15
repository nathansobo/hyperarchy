module("Views", function(c) { with(c) {
  def("GroupsList", {
    content: function(b) { with(b) {
      div({'id': "groups_list"}, function() {
        h1("Groups");
        ul();
      });
    }},

    methods: {
      initialize: function() {
        var self = this;
        this.ul_node = this.find("ul");
        this.remote_domain = June.remote("/domain");
        this.remote_domain.pull([Group], function() {
          self.render_groups();
        });
        this.group_selection_subscription_node = new June.SubscriptionNode();
      },

      render_groups: function() {
        var view = this;
        
        Group.each(function() {
          var group = this;
          var group_li = Prez.build(function(b) {
            b.li(group.name(), {'class': "group"});
          });
          
          group_li.click(function() { view.group_selected(group) });
          view.ul_node.append(group_li);
        });
      },

      group_selected: function(group) {
        this.group_selection_subscription_node.publish(group);
      },

      on_group_selected: function(callback) {
        this.group_selection_subscription_node.subscribe(callback);
      }
    }
  });
}});