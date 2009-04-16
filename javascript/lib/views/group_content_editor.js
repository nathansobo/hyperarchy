module("Views", function(c) { with(c) {
  def("GroupContentEditor", {
    content: function(b) { with(b) {

      div({'id': "group_content_editor"}, function() {
        table({'id': "navigator"}, function() {
          tbody(function() {
            tr(function() {
              th("Tracks");
            })
            tr(function() {
              td(function() {
                ul({'id': "tracks_list"});
              });
            });
          });
        });

        console.debug(Views.EditTrackForm);
        
        subview("edit_track_form", Views.EditTrackForm);
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
          self.populate_tracks(group);
        });
      },

      populate_tracks: function(group) {
        var self = this;

        this.tracks_list.html("");
        group.tracks.each(function() {
          var track = this;
          var track_li = Prez.build(function(b) {
            b.li(track.name(), {'class': "menu_item"});
          });
          track_li.click(function() {
            self.edit_track(track);
          });
          
          console.debug(track_li.html());
          self.tracks_list.append(track_li);
        });
      },

      edit_track: function(track) {
        console.debug(this.edit_track_form);
        this.edit_track_form.foo();

        this.edit_track_form.model = track;
        this.edit_track_form.load();
        this.edit_track_form.show();
        

      }


    }


  });
}});