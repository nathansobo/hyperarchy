_.constructor("Views.CandidateCommentsList", View.Template, {
  content: function() { with(this.builder) {
    div({id: "candidateCommentsList"}, function() {
      subview('candidateCommentsList', Views.SortedList, {
        rootAttributes: { id: "candidateComments", 'class': "candidateComments" },
        buildElement: function(candidateComment) {
          return Views.CandidateCommentLi.toView({candidateComment: candidateComment});
        }
      });

      div({id: "createCommentForm"}, function() {
          textarea({id: "shortAnswer"})
            .ref('createCommentTextarea')
            .keypress(function(view, e) {
              if (e.keyCode === 13) {
                view.createCommentButton.click();
                return false;
              }
            });
          div({'class': "clear"});

          button({id: "createCommentButton"}, "Make a Comment")
            .ref('createCommentButton')
            .click('createComment');

          div({'class': "loading", style: "display: none;"}).ref("createCommentSpinner");
          div({'class': "clear"});
      }).ref('createCommentForm');

      div({'class': "loading fetching", style: "display: none"}).ref('loading');
    });
  }},

  viewProperties: {
    initialize: function() {
//      var adjustHeight = this.hitch('adjustHeight');
//      _.defer(adjustHeight);
//      $(window).resize(adjustHeight);
    },

    candidate: {
      afterChange: function(candidate) {
        // something?
      }
    },

    empty: function() {
      this.candidateCommentsList.empty();
    },

    fadeIn: function($super) {
      $super();
      this.adjustHeight();
    },

    afterShow: function() {
      this.adjustHeight();
    },

    adjustHeight: function() {
      this.candidateCommentsList.fillVerticalSpace(50, 200);
      this.loading.position({
        my: 'center center',
        at: 'center center',
        of: this.rankedCandidatesList
      });
    },

    createComment: function(elt, e) {
      this.createCommentTextarea.blur();
      e.preventDefault();
      if (this.commentCreationDisabled) return;

      var body = this.createCommentTextarea.val();
      if (body === "") return;

      this.createCommentTextarea.attr('disabled', true);
      this.commentCreationDisabled = true;

      this.createCommentSpinner.show();
      this.candidate().candidateComments().create({body: body})
        .onSuccess(function() {
          this.createCommentSpinner.hide();
        }, this);
    }
  }
});
