_.constructor("Views.Elections", View.Template, {
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

      this.electionsSubscriptions = new Monarch.SubscriptionBundle();

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
      afterChange: function(elections) {
        this.electionsOl.html("");
        this.electionsSubscriptions.destroyAll();
        elections.subscribe().onSuccess(function(subscription) {
          this.electionsSubscriptions.add(subscription);
        }, this);
        this.fetchingElections = elections.fetch();
        this.fetchingElections.afterEvents(function() {
          elections.each(this.hitch('addElectionToList'));
          this.electionsSubscriptions.add(elections.onRemoteInsert(this.hitch('addElectionToList')));
          delete this.fetchingElections;
        }, this);
      }
    },

    addElectionToList: function(election) {
      this.electionsOl.appendView(function(b) {
        b.li({electionId: election.id()}, election.body()).click(function() {
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
      if (this.fetchingElections) {
        this.fetchingElections.afterEvents(function() {
          this.navigate(electionId);
        }, this);
        return;
      }

      this.electionSelected(Election.find(electionId));
    }
  }
});
