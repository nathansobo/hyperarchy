module("Views", function(c) { with(c) {
  def("Navigator", {
    content: function(b) { with(b) {
      table({'id': "navigator"}, function() {
        tbody(function() {
          tr(function() {
            th("Groups");
            th("Tracks");
            th("Subtracks");
            th("Question Sets");
            th("Questions");
          });

          tr(function() {
            td(function() {
              ol({'id': "groups_list"})
            });
            td(function() {
              ol({'id': "tracks_list"})
            });
            td(function() {
              ol({'id': "subtracks_list"})
            });
            td(function() {
              ol({'id': "question_sets_list"})
            });
            td(function() {
              ol({'id': "questions_list"})
            });
          });
        });
      });
    }},

    methods: {
      initialize: function() {
        this.store_pointers_to_lists();
        this.initialize_subscription_nodes();
        this.remote_global_domain = June.remote("/domain");
        this.populate_groups_list();
      },

      store_pointers_to_lists: function() {
        this.groups_list = this.find("#groups_list");
        this.tracks_list = this.find("#tracks_list");
        this.subtracks_list = this.find("#subtracks_list");
        this.question_sets_list = this.find("#question_sets_list");
        this.questions_list = this.find("#questions_list");
      },

      initialize_subscription_nodes: function() {
        this.on_group_selected_node = new June.SubscriptionNode();
        this.on_track_selected_node = new June.SubscriptionNode();
        this.on_subtrack_selected_node = new June.SubscriptionNode();
        this.on_question_set_selected_node = new June.SubscriptionNode();
        this.on_question_selected_node = new June.SubscriptionNode();
      },

      on_group_selected: function(fn) {
        this.group_selected_node.subscribe(fn);
      },

      on_track_selected: function(fn) {
        this.on_track_selected_node.subscribe(fn);
      },

      on_subtrack_selected: function(fn) {
        this.on_subtrack_selected_node.subscribe(fn);
      },

      on_question_set_selected: function(fn) {
        this.on_question_set_selected_node.subscribe(fn);
      },

      on_question_selected: function(fn) {
        this.on_question_selected_node.subscribe(fn);
      },

      group_selected: function(group) {
        this.remote_group_domain = June.remote("/domain/groups/" + group.id());
        this.tracks_list.html("");
        this.subtracks_list.html("");
        this.question_sets_list.html("");
        this.questions_list.html("");
        this.populate_tracks_list(group);
        this.on_group_selected_node.publish(group);
      },

      track_selected: function(track) {
        this.subtracks_list.html("");
        this.question_sets_list.html("");
        this.questions_list.html("");
        this.populate_subtracks_list(track);
        this.on_track_selected_node.publish(track);
      },

      subtrack_selected: function(subtrack) {
        this.question_sets_list.html("");
        this.questions_list.html("");
        this.populate_question_sets_list(subtrack);
        this.on_subtrack_selected_node.publish(subtrack);
      },

      question_set_selected: function(question_set) {
        this.questions_list.html("");
        this.populate_questions_list(question_set);
        this.on_question_set_selected_node.publish(question_set);
      },

      question_selected: function(question_set) {
        this.on_question_selected_node.publish(question_set);
      },

      populate_groups_list: function() {
        var self = this;
        var render_groups = function() {
          Group.each(function(group) {
            var group_li = Prez.build(function(b) {
              b.li(group.name(), {'class': "menu_item"});
            });
            group_li.click(function() { self.group_selected(group) });
            self.groups_list.append(group_li);
          });
        };

        this.remote_global_domain.pull([Group], render_groups);
      },

      populate_tracks_list: function(group) {
        var self = this;
        var render_tracks = function() {
          group.tracks.each(function(track) {
            var track_li = Prez.build(function(b) {
              b.li(track.name(), {'class': "menu_item"});
            });
            track_li.click(function() {
              self.track_selected(track);
            });
            self.tracks_list.append(track_li);
          });
        };

        this.remote_group_domain.pull([group.tracks_relation], render_tracks);
      },

      populate_subtracks_list: function(track) {
        var self = this;
        var render_subtracks = function() {
          track.subtracks.each(function(subtrack) {
            var subtrack_li = Prez.build(function(b) {
              b.li(subtrack.name(), {'class': "menu_item"});
            });
            subtrack_li.click(function() {
              self.subtrack_selected(subtrack);
            });
            self.subtracks_list.append(subtrack_li);
          });
        };

        this.remote_group_domain.pull([track.subtracks_relation], render_subtracks);
      },

      populate_question_sets_list: function(subtrack) {
        var self = this;
        var render_question_sets = function() {
          subtrack.question_sets.each(function(question_set) {
            var question_set_li = Prez.build(function(b) {
              b.li(question_set.name(), {'class': "menu_item"});
            });
            question_set_li.click(function() {
              self.question_set_selected(question_set);
            });
            self.question_sets_list.append(question_set_li);
          });
        };

        this.remote_group_domain.pull([subtrack.question_sets_relation], render_question_sets);
      },

      populate_questions_list: function(question_set) {
        var self = this;
        var render_questions = function() {
          question_set.questions.each(function(question) {
            var question_li = Prez.build(function(b) {
              b.li(question.name(), {'class': "menu_item"});
            });
            question_li.click(function() {
              self.question_selected(question);
            });
            self.questions_list.append(question_li);
          });
        };

        this.remote_group_domain.pull([question_set.questions_relation], render_questions);
      }
    }
  });
}});
