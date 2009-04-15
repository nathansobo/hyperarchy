module("Views", function(c) { with(c) {
  def("GroupContentEditor", {
    content: function(b) { with(b) {
      table({'id': "group_content_editor"}, function() {
        tbody(function() {
          tr(function() {
            td(function() {
              div({'id': "tracks_list"});
            });
          });
        });
      });
    }},

    methods: {
      initialize: function() {
        this.tracks_list = this.find("#tracks_list");
      },

      edit_group: function(group) {
        var self = this;
        this.group = group;
        this.remote_group = June.remote("/domain/groups/" + group.id());

        this.remote_group.pull([group.tracks_relation], function() {
          self.populate_tracks(group.tracks());
        });
      },

      populate_tracks: function(tracks) {
        console.debug(tracks);
      }
    }


  });
}});