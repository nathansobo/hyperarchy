_.constructor('Views.Lightboxes.NewElection', Views.Lightboxes.Lightbox, {
  id: "new-election",

  lightboxContent: function() { with(this.builder) {
    form(function() {
      h1("Enter your question:")
      textarea({'class': "body", name: "body", tabindex: 101}).ref('body');
      subview('charsRemaining', Views.Components.CharsRemaining, {limit: 140});

      label({'for': "details"}, "Further Details")
      textarea({'class': "details", name: "details", tabindex: 102}).ref('details');

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

      var fieldValues = this.fieldValues();

      var performCreate = this.bind(function() {
        Application.currentOrganization().elections().create(fieldValues)
          .success(function(election) {
            this.hide();
            History.pushState(null, null, election.url());
          }, this);
      });

      if (Application.currentUser().guest()) {
        Application.promptSignup().success(performCreate).invalid(function() {
          this.show();
          this.body.val(fieldValues.body);
          this.details.val(fieldValues.details);
        }, this);
      } else {
        performCreate();
      }
      
      return false;
    }
  }
});