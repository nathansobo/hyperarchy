_.constructor("Views.Rankings", View.Template, {
  content: function() { with(this.builder) {
    div({id: "ranking", 'class': "widget itemList"}, function() {
      div({'class': "widgetContent"}, function() {
        ol().ref("rankingsOl");
      }).ref('widgetContent');
    });
  }},

  viewProperties: {
    initialize: function() {
      var self = this;
      this.registerResizeCallbacks();

      _.defer(function() {
        self.rankingsOl.sortable({
          connectWith: "#candidates ol",

          update: function(event, ui) {
            self.handleUpdate(ui.item);
          }
        });
      });
    },

    election: {
      afterChange: function(election) {
        this.rankings = election.rankings().forUser(Application.currentUser());
        Server.fetch([election.candidates(), this.rankings])
          .afterEvents(function() {
            this.populateRankings();
          }, this);
      }
    },
    
    populateRankings: function() {
      this.rankingsOl.empty();
      this.rankings.each(function(ranking) {
        this.rankingsOl.append(Views.Candidate.toView({ranking: ranking}));
      }, this);
    },

    handleUpdate: function(item) {
      if (item.parents("#ranking").length == 0) this.rankingsOl.sortable('cancel');

      var candidateId = item.attr('candidateId');
      var predecessorId = item.prev().attr('candidateId');
      var successorId = item.next().attr('candidateId');

      var candidate = candidateId ? Candidate.find(candidateId) : null;
      var predecessor = predecessorId ? Candidate.find(predecessorId) : null;
      var successor = successorId ? Candidate.find(successorId) : null;

      Ranking.createOrUpdate(Application.currentUser(), this.election(), candidate, predecessor, successor);
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
      this.rankingsOl.height(height);
    }
  }
});
