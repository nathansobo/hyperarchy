_.constructor('Views.Lightboxes.NewQuestion', Views.Lightboxes.Lightbox, {
  id: "new-question",

  lightboxContent: function() { with(this.builder) {
    form(function() {
      h1("Enter your question:")
      textarea({'class': "body", name: "body", tabindex: 101}).ref('body');
      subview('charsRemaining', Views.Components.CharsRemaining, {limit: 140});

      label({'for': "details"}, "Further Details")
      textarea({'class': "details", name: "details", tabindex: 102}).ref('details');

      div(function() {
        input({type: "checkbox", checked: true, id: "share-question-on-facebook"}).ref('shareOnFacebook');
        label({'for': "share-question-on-facebook"}, "Share this question on Facebook");
      }).ref('share');

      input({'type': 'submit', 'class': "button", value: "Ask Question", tabindex: 103}).ref('submit');
    }).ref('form').submit('create');
  }},

  viewProperties: {
    attach: function() {
      this.find('textarea').elastic();
      this.charsRemaining.field(this.body);
      this.body.keydown('return', this.hitch('create'));
    },

    afterShow: function($super) {
      $super();
      this.find('textarea').val("").keyup();
      if (Application.currentOrganization().isPublic()) {
        this.shareOnFacebook.attr('checked', true);
        this.share.show();
      } else {
        this.shareOnFacebook.attr('checked', false);
        this.share.hide();
      }
    },

    create: function() {
      var fieldValues = this.fieldValues();
      if ($.trim(fieldValues.body) === "") return false;
      if (fieldValues.body.length > 140) return false;

      this.ensureLoggedIn(fieldValues)
        .success(function(shareOnFacebook) {
          Application.currentOrganization().questions().create(fieldValues)
            .success(function(question) {
              question.trackCreate();
              this.hide();
              History.pushState(null, null, question.url());
              if (shareOnFacebook) question.shareOnFacebook();
            }, this);
        }, this);
      return false;
    },

    ensureLoggedIn: function(fieldValues) {
      var currentUser = Application.currentUser();
      var promise = new Monarch.Promise();
      var shareOnFacebook = this.shareOnFacebook.attr('checked');

      var ensureLoggedIn = this.bind(function() {
        if (shareOnFacebook) {
          Application.facebookLogin()
            .success(function() {
              promise.triggerSuccess(true)
            })
            .invalid(function() {
              if (currentUser.guest()) {
                shareOnFacebook = false;
                ensureLoggedIn();
              } else {
                promise.triggerSuccess(false);
              }
            }, this);
        } else {
          Application.promptSignup()
            .success(function() {
              promise.triggerSuccess(false);
            })
            .invalid(function() {
              if (currentUser.guest()) {
                this.show();
                this.body.val(fieldValues.body);
                this.details.val(fieldValues.details);
              }
            }, this);
        }
      });

      ensureLoggedIn();
      return promise;
    }
  }
});