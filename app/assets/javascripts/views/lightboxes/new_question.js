_.constructor('Views.Lightboxes.NewQuestion', Views.Lightboxes.Lightbox, {
  id: "new-question",

  lightboxContent: function() { with(this.builder) {
    form(function() {
      h1("Enter your question:")
      textarea({'class': "body", name: "body", tabindex: 101}).ref('body');
      subview('charsRemaining', Views.Components.CharsRemaining, {limit: 140});

      label({'for': "details"}, "Further Details")
      textarea({'class': "details", name: "details", tabindex: 102}).ref('details');

      input({type: "checkbox", checked: true}).ref('shareOnFacebook');
      label("Share this question on Facebook")

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
    },

    create: function() {
      if ($.trim(this.body.val()) === "") return false;
      if (this.body.val().length > 140) return false;

      var fieldValues = this.fieldValues();
      var shareOnFacebook = this.shareOnFacebook.attr('checked');

      var authenticateUser = Application.currentUser().guest() ? Application.facebookLogin : Application.promptSignup();

      var beforeCreateWithFacebookSharing = this.bind(function() {
        Application.facebookLogin()
          .success(actuallyPerformCreate)
          .invalid(function() {
            shareOnFacebook = false;
            beforeCreateWithoutFacebookSharing();
          });
      });

      var beforeCreateWithoutFacebookSharing = this.bind(function() {
        if (Application.currentUser().guest()) {
          Application.promptSignup().success(actuallyPerformCreate).invalid(function() {
            this.show();
            this.body.val(fieldValues.body);
            this.details.val(fieldValues.details);
          }, this);
        } else {
          actuallyPerformCreate();
        }
      });

      var actuallyPerformCreate = this.bind(function() {
        Application.currentOrganization().questions().create(fieldValues)
          .success(function(question) {
            this.hide();
            History.pushState(null, null, question.url());
            if (shareOnFacebook) question.shareOnFacebook();
          }, this);
      });

      if (shareOnFacebook) {
        beforeCreateWithFacebookSharing();
      } else {
        beforeCreateWithoutFacebookSharing();
      }

      return false;
    }
  }
});