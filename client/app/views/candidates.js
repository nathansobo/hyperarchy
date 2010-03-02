constructor("Views.Candidates", View.Template, {
  content: function() { with(this.builder) {
    div({id: "candidates", 'class': "widget item_list"}, function() {
      div({'class': "widget_header"}, function() {
        textarea().ref("create_candidate_input");
        button({id: "create_candidate", 'class': "create"}, "propose answer").click(function(view) {
          view.create_candidate();
        });
      });
      div({'class': "widget_content"}, function() {
        ol().ref("candidates_ol");
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

    candidates: function(candidates) {
      if (arguments.length == 0) {
        return this._candidates;
      } else {
        var self = this;
        this._candidates = candidates;
        this.candidates_ol.html("");
        candidates.fetch()
          .after_events(function() {
            candidates.each(self.hitch('add_candidate_to_list'));
            candidates.on_remote_insert(self.hitch('add_candidate_to_list'));
          });
      }
    },

    add_candidate_to_list: function(candidate) {
      this.candidates_ol.append_view(function(b) {
        b.li(candidate.body())
      });
    },

    create_candidate: function() {
      this.candidates().create({body: this.create_candidate_input.val()});
    }
  }
});
