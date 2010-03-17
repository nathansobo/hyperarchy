constructor("Views.Rankings", View.Template, {
  content: function() { with(this.builder) {
    div({id: "ranking", 'class': "widget itemList"}, function() {
      div({'class': "widgetContent"}, function() {
        ol().ref("rankingOl");
      }).ref('widgetContent');
    });
  }},

  viewProperties: {
    initialize: function() {
      var self = this;
      this.registerResizeCallbacks();

      _.defer(function() {
        self.rankingOl.sortable({
          connectWith: "#candidates ol",

          update: function(event, ui) {
            self.handleUpdate(ui.item);
          }
        });
      });
    },

    election: function(election) {
      if (arguments.length == 0) {
        return this._election;
      } else {
        return this._election = election;
      }
    },

    handleUpdate: function(item) {
      if (item.parents("#ranking").length == 0) return this.handleRemoval(item);

      var candidateId = item.attr('candidateId');
      var predecessorId = item.prev().attr('candidateId');
      var successorId = item.next().attr('candidateId');

      var candidate = candidateId ? Candidate.find(candidateId) : null;
      var predecessor = predecessorId ? Candidate.find(predecessorId) : null;
      var successor = successorId ? Candidate.find(successorId) : null;

      Ranking.createOrUpdate(Application.currentUser(), this.election(), candidate, predecessor, successor);
    },

    handleRemoval: function(item) {
      console.debug("REMOVAL", item.attr('candidateId'));
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
      this.rankingOl.height(height);
    }
  }
});
