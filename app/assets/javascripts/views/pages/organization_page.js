_.constructor('Views.Pages.Organization', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "organization"}, function() {

      div({id: "headline"}, function() {
        a({'class': "new button"}, "Ask A Question").ref('newQuestionButton').click('newQuestion');
        h1("Choose A Question:");
      });

      subview("questionsList", Views.Components.SortedList, {
        buildElement: function(question) {
          return Views.Pages.Organization.QuestionLi.toView({question: question});
        }
      });

      div({id: "list-bottom"}, function() {
        subview('spinner', Views.Components.Spinner);
      }).ref("listBottom");
    });
  }},

  viewProperties: {
    attach: function() {
      $(window).scroll(this.hitch('fetchIfNeeded'));
    },

    organization: {
      change: function(organization) {
        Application.currentOrganizationId(organization.id());
        this.questionsList.relation(null);
        this.loading(true);

        organization.trackView();

        return organization.fetchMoreQuestions()
          .success(this.bind(function() {
            this.stopLoadingIfNeeded();
            this.questionsList.relation(organization.questions());
          }));
      }
    },

    params: {
      write: function(newParams, oldParams) {
        if (oldParams && newParams.organizationId === oldParams.organizationId) {
          Application.scrollTop(this.previousScrollPosition || 0);
        } else {
          Application.scrollTop(0);
        }
      },

      change: function(params) {
        var organization = Organization.find(params.organizationId);
        if (!organization) History.replaceState(null,  null, Application.currentUser().defaultOrganization().url());
        this.organization(organization);
      }
    },

    beforeHide: function() {
      if (!this.is(":visible")) return;
      this.previousScrollPosition = Application.scrollTop();
      console.debug(this.previousScrollPosition);
    },

    newQuestion: function() {
      Application.newQuestion.show();
    },

    fetchIfNeeded: function() {
      if (!this.is(':visible')) return;
      if (!this.questionsList.relation()) return;
      if (this.remainingScrollHeight() < this.listBottom.height() * 2) {
        this.organization().fetchMoreQuestions().success(this.hitch('stopLoadingIfNeeded'));
      }
    },

    stopLoadingIfNeeded: function() {
      if (this.organization().numQuestionsFetched >= this.organization().questionCount()) {
        this.loading(false);
      }
    },

    loading: {
      change: function(loading) {
        if (loading) {
          this.spinner.show();
          this.listBottom.show();
        } else {
          this.spinner.hide();
          this.listBottom.hide();
        }
      }
    },

    remainingScrollHeight: function() {
      var doc = $(document), win = $(window);
      return doc.height() - doc.scrollTop() - win.height();
    }
  }
});
