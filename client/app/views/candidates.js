constructor("Views.Candidates", View.Template, {
  content: function() { with(this.builder) {
    div({id: "candidates", 'class': "widget itemList"}, function() {
      div({'class': "widgetHeader"}, function() {
        textarea().ref("createCandidateInput");
        button({id: "createCandidate", 'class': "create"}, "propose answer").click(function(view) {
          view.createCandidate();
        });
      });
      div({'class': "widgetContent"}, function() {
        ol().ref("candidatesOl");
      }).ref('widgetContent');
    });
  }},

  viewProperties: {
    initialize: function() {
      var self = this;
      this.registerResizeCallbacks();

      _.defer(function() {
        var cancelSort = true;

        self.candidatesOl.sortable({
          connectWith: "#ranking ol",
          stop: function() {
            if (cancelSort) {
              self.candidatesOl.sortable('cancel');
            } else {
              cancelSort = true;
            }
          },

          remove: function() {
            cancelSort = false;
          }
        })
      });
    },

    registerResizeCallbacks: function() {
      var self = this;
      $(window).resize(function() {
        self.fillHeight();
      });

      _.defer(function() {
        self.fillHeight();
      });
    },


    fillHeight: function() {
      var height = $(window).height() - this.widgetContent.offset().top - 10;
      this.candidatesOl.height(height);
    },

    candidates: function(candidates) {
      if (arguments.length == 0) {
        return this.Candidates;
      } else {
        var self = this;
        this.Candidates = candidates;
        candidates.fetch()
          .afterEvents(function() {
            self.populateCandidates();
            candidates.onRemoteInsert(self.hitch('addCandidateToList'));
          });
      }
    },

    populateCandidates: function() {
      this.candidatesOl.html("");
      this.candidates().each(this.hitch('addCandidateToList'));
    },

    addCandidateToList: function(candidate) {
      var candidateLi = View.build(function(b) {
        b.li({candidateId: candidate.id()}, candidate.body());
      });
      this.candidatesOl.append(candidateLi);
    },

    createCandidate: function() {
      this.candidates().create({body: this.createCandidateInput.val()});
    }
  }
});
