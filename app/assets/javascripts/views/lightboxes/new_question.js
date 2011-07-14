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
      var fieldValues = this.fieldValues();
      if ($.trim(fieldValues.body) === "") return false;
      if (fieldValues.body.length > 140) return false;

      this.ensureLoggedIn(fieldValues)
        .success(function(fbConnected) {
          Application.currentOrganization().questions().create(fieldValues)
            .success(function(question) {
              this.hide();
              History.pushState(null, null, question.url());
              if (this.shareOnFacebook.attr('checked') && fbConnected) question.shareOnFacebook();
            }, this);
        }, this);
      return false;
    },

    ensureLoggedIn: function(fieldValues) {
      var currentUser = Application.currentUser();
      var promise = new Monarch.Promise();

      var ensureLoggedIn = this.bind(function() {
        if (this.shareOnFacebook.attr('checked')) {
          Application.facebookLogin()
            .success(function() {
              promise.triggerSuccess(true)
            })
            .invalid(function() {
              if (currentUser.guest()) {
                this.shareOnFacebook.attr('checked', false);
                ensureLoggedIn();
              } else {
                promise.triggerSuccess(false);
              }
            }, this);
        } else {
          Application.promptSignup()
            .success(promise.hitch('triggerSuccess'))
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