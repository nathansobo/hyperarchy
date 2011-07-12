_.constructor('Views.Pages.Question.CurrentConsensus', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "current-consensus"}, function() {
      subview('list', Views.Components.SortedList, {
        buildElement: function(answer) {
          return Views.Pages.Question.AnswerLi.toView({answer: answer});
        },

        onUpdate: function(element, record) {
          element.position.text(record.position());
          element.body.markdown(record.body());
        }
      });
    })
  }},

  viewProperties: {

    attach: function($super) {
      $super();
      this.registerInterest(Application, 'onCurrentUserChange', this.hitch('handleCurrentUserChange'));
    },

    handleCurrentUserChange: function() {
      if (! this.answers()) return;
      this.updateStatuses();
      this.observeCurrentUserRankings();
    },

    answers: {
      change: function(answers) {
        this.list.relation(answers);
        this.updateStatuses();
        this.observeCurrentUserRankings();
        this.observeAnswers();
      }
    },

    observeCurrentUserRankings: function() {
      var currentUserRankings = Application.currentUser().rankings();
      this.registerInterest('rankings', currentUserRankings, 'onUpdate', this.hitch('updateStatus'));
      this.registerInterest('rankings', currentUserRankings, 'onInsert', this.hitch('updateStatus'));
      this.registerInterest('rankings', currentUserRankings, 'onRemove', this.hitch('clearStatus'));
    },

    observeAnswers: function() {
      this.registerInterest('answers', this.answers(), 'onUpdate', function(answer, changeset) {
        if (changeset.commentCount || changeset.details) {
          this.list.elementForRecord(answer).showOrHideEllipsis();
        }
      }, this);
    },

    selectedAnswer: {
      change: function(selectedAnswer) {
        this.list.find('li').removeClass('selected');
        if (selectedAnswer) this.list.elementForRecord(selectedAnswer).addClass('selected');
      }
    },

    updateStatuses: function() {
      var currentUserRankings = Application.currentUser().rankings();
      this.answers().each(function(answer) {
        var ranking = currentUserRankings.find({answerId: answer.id()});
        this.list.elementForRecord(answer).ranking(ranking);
      }, this);
    },

    updateStatus: function(ranking) {
      var answer = ranking.answer();
      this.list.elementForRecord(answer).ranking(ranking);
    },

    clearStatus: function(ranking) {
      var answer = ranking.answer();
      if (!answer) return;
      this.list.elementForRecord(answer).ranking(null);
    }
  }
});
