_.constructor('Views.Pages.Election.CurrentConsensus', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "current-consensus"}, function() {
      subview('list', Views.Components.SortedList, {
        buildElement: function(candidate) {
          return Views.Pages.Election.CandidateLi.toView({candidate: candidate});
        },

        onUpdate: function(element, record) {
          element.position.text(record.position());
        }
      });
    })
  }},

  viewProperties: {
    candidates: {
      change: function(candidates) {
        this.list.relation(candidates);
      }
    },

    selectedCandidate: {
      change: function(selectedCandidate) {
        this.list.find('li').removeClass('selected');
        if (selectedCandidate) this.list.elementForRecord(selectedCandidate).addClass('selected');
      }
    }
  }
});
