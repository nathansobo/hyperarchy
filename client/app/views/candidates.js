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
      this.register_resize_callbacks();

      _.defer(function() {
        var cancel_sort = true;

        self.candidates_ol.sortable({
          connectWith: "#ranking ol",
          stop: function() {
            if (cancel_sort) {
              self.candidates_ol.sortable('cancel');
            } else {
              cancel_sort = true;
            }
          },

          remove: function() {
            cancel_sort = false;
          }
        })
      });
    },

    register_resize_callbacks: function() {
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
      this.candidates_ol.height(height);
    },

    candidates: function(candidates) {
      if (arguments.length == 0) {
        return this._candidates;
      } else {
        var self = this;
        this._candidates = candidates;
        candidates.fetch()
          .after_events(function() {
            self.populate_candidates();
            candidates.on_remote_insert(self.hitch('add_candidate_to_list'));
          });
      }
    },

    populate_candidates: function() {
      this.candidates_ol.html("");
      this.candidates().each(this.hitch('add_candidate_to_list'));
    },

    add_candidate_to_list: function(candidate) {
      var candidate_li = View.build(function(b) {
        b.li({candidate_id: candidate.id()}, candidate.body());
      });
      this.candidates_ol.append(candidate_li);
    },

    create_candidate: function() {
      this.candidates().create({body: this.create_candidate_input.val()});
    }
  }
});
