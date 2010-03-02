constructor("Views.Elections", View.Template, {
  content: function() { with(this.builder) {
    div({id: "elections", 'class': "widget item_list"}, function() {
      div({'class': "widget_header"}, function() {
        textarea().ref("create_election_input");
        button({id: "create_election", 'class': "create"}, "raise question").click(function(view) {
          view.create_election();
        });
      });

      div({'class': "widget_content"}, function() {
        ol().ref("elections_ol")
      }).ref('widget_content');
    });
  }},

  view_properties: {
    initialize: function() {
      var self = this;
      $(window).resize(function() {
        self.fill_height();
      });

      _.defer(function() {
        self.fill_height();
      });
    },

    fill_height: function() {
      var height = $(window).height() - this.widget_content.offset().top - 10;
      this.widget_content.height(height);
    },

    elections: function(elections) {
      if (arguments.length == 0) {
        return this._elections;
      } else {
        var self = this;
        this._elections = elections;
        this.elections_ol.html("");
        elections.fetch()
          .after_events(function() {
            elections.each(self.hitch('add_election_to_list'));
            elections.on_remote_insert(self.hitch('add_election_to_list'));
          });
      }
    },

    add_election_to_list: function(election) {
      var self = this;
      this.elections_ol.append_view(function(b) {
        b.li(election.body()).click(function(li) {
          self.election_selected(election, li);
        });
      });
    },

    election_selected: function(election, li) {
      this.elections_ol.find('li').removeClass('selected');
      li.addClass('selected');
      this.candidates_view.candidates(election.candidates());
    },

    create_election: function() {
      this.elections().create({body: this.create_election_input.val()});
    }
  }
});
