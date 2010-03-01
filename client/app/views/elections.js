constructor("Views.Elections", View.Template, {
  content: function() { with(this.builder) {
    div({id: "elections", 'class': "widget elections_candidates"}, function() {
      div({'class': "widget_header"}, function() {
        textarea().ref("create_election_input");
        button({id: "create_election", 'class': "create"}, "raise question").click(function(view) {
          view.create_election();
        });
      });

      div({'class': "widget_content"}, function() {
        ul().ref("elections_ul")
      });
    });
  }},

  view_properties: {
    elections: function(elections) {
      if (arguments.length == 0) {
        return this._elections;
      } else {
        var self = this;
        this._elections = elections;
        this.elections_ul.html("");
        elections.fetch()
          .after_events(function() {
            elections.each(self.hitch('add_election_to_list'));
            elections.on_remote_insert(self.hitch('add_election_to_list'));
          });
      }
    },

    add_election_to_list: function(election) {
      this.elections_ul.append_view(function(b) {
        b.li(election.body())
      });
    },

    create_election: function() {
      this.elections().create({body: this.create_election_input.val()});
    }
  }
});
