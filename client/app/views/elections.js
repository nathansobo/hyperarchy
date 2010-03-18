constructor("Views.Elections", View.Template, {
  content: function() { with(this.builder) {
    div({id: "elections", 'class': "widget itemList"}, function() {
      div({'class': "widgetHeader"}, function() {
        textarea().ref("createElectionInput");
        button({id: "createElection", 'class': "create"}, "raise question").click(function(view) {
          view.createElection();
        });
      });

      div({'class': "widgetContent"}, function() {
        ol().ref("electionsOl")
      }).ref('widgetContent');
    });
  }},

  viewProperties: {
    initialize: function() {
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
      this.widgetContent.height(height);
    },

    elections: {
      afterWrite: function(elections, previousElections) {
        if (elections === previousElections) return;
        
        var self = this;
        this.electionsOl.html("");
        this.fetchingElections = elections.fetch();
        this.fetchingElections.afterEvents(function() {
          elections.each(self.hitch('addElectionToList'));
          elections.onRemoteInsert(self.hitch('addElectionToList'));
          delete self.fetchingElections;
        });
      }
    },

    addElectionToList: function(election) {
      var self = this;
      this.electionsOl.appendView(function(b) {
        b.li({electionId: election.id()}, election.body()).click(function(li) {
          History.load(Routes.electionPath(election));
        });
      });
    },

    electionSelected: function(election) {
      this.electionsOl.find('li').removeClass('selected');
      this.electionsOl.find("li[electionId='" + election.id() + "']").addClass('selected');
      this.rankingsView.election(election);
      this.candidatesView.election(election);
    },

    createElection: function() {
      this.elections().create({body: this.createElectionInput.val()});
    },

    navigate: function(electionId) {
      var self = this;
      if (this.fetchingElections) {
        this.fetchingElections.afterEvents(function() {
          self.navigate(electionId);
        });
        return;
      }

      this.electionSelected(Election.find(electionId));
    }
  }
});
