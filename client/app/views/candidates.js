_.constructor("Views.Candidates", View.Template, {
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
      this.candidatesSubscriptions = new Monarch.SubscriptionBundle();

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


    election: {
      afterChange: function(election) {
        this.candidatesSubscriptions.destroyAll();
        Server.fetch([election.candidates(), election.rankings().forUser(Application.currentUser())])
          .afterEvents(function() {
            this.populateCandidates();
            this.candidatesSubscriptions.add(election.unrankedCandidates().onRemoteInsert(this.hitch('addCandidateToList')));
          }, this);
      }
    },

    candidates: function() {
      return this.election().candidates();
    },

    populateCandidates: function() {
      this.candidatesOl.html("");
      this.election().unrankedCandidates().each(this.hitch('addCandidateToList'));
    },

    addCandidateToList: function(candidate) {
      this.candidatesOl.append(Views.Candidate.toView({candidate: candidate}));
    },

    createCandidate: function() {
      this.candidates().create({body: this.createCandidateInput.val()});
    }
  }
});
