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

    elections: function(elections) {
      if (arguments.length == 0) {
        return this.Elections;
      } else {
        var self = this;
        this.Elections = elections;
        this.electionsOl.html("");
        elections.fetch()
          .afterEvents(function() {
            elections.each(self.hitch('addElectionToList'));
            elections.onRemoteInsert(self.hitch('addElectionToList'));
          });
      }
    },

    addElectionToList: function(election) {
      var self = this;
      this.electionsOl.appendView(function(b) {
        b.li(election.body()).click(function(li) {
          self.electionSelected(election, li);
        });
      });
    },

    electionSelected: function(election, li) {
      this.electionsOl.find('li').removeClass('selected');
      li.addClass('selected');
      this.candidatesView.candidates(election.candidates());
    },

    createElection: function() {
      this.elections().create({body: this.createElectionInput.val()});
    }
  }
});
