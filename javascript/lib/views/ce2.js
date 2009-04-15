module("Views", function(c) { with(c) {
  def("CE2", {
    content: function(b) { with(b) {
      div(function() {
        subview("groups_list", Views.GroupsList);
        subview("group_content_editor", Views.GroupContentEditor);
      });
    }},

    methods: {
      initialize: function() {
        var self = this;
        this.groups_list.on_group_selected(function(group) {
          self.group_content_editor.edit_group(group);
        });
      }
    }
  });
}});