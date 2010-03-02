constructor("Views.Candidates", View.Template, {
  content: function() { with(this.builder) {
    div({id: "candidates", 'class': "widget elections_candidates"}, function() {
      div({'class': "widget_header"}, function() {
        textarea().ref("create_candidate_input");
        button({id: "create_candidate", 'class': "create"}, "propose answer").click(function(view) {
          view.create_candidate();
        });
      });
      div({'class': "widget_content"}, function() {
        ul().ref("candidates_ul");
      });
    });
  }},

  view_properties: {
    candidates: function(candidates) {
      if (arguments.length == 0) {
        return this._candidates;
      } else {
        var self = this;
        this._candidates = candidates;
        this.candidates_ul.html("");
        candidates.fetch()
          .after_events(function() {
            candidates.each(self.hitch('add_candidate_to_list'));
            candidates.on_remote_insert(self.hitch('add_candidate_to_list'));
          });
      }
    },

    add_candidate_to_list: function(candidate) {
      this.candidates_ul.append_view(function(b) {
        b.li(candidate.body())
      });
    },

    create_candidate: function() {
      this.candidates().create({body: this.create_candidate_input.val()});
    }
  }
});
