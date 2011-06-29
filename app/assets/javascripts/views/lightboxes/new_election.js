_.constructor('Views.Lightboxes.NewElection', Views.Lightboxes.Lightbox, {
  id: "new-election",

  lightboxContent: function() { with(this.builder) {
    form(function() {
      h1("Enter your question:")
      textarea({'class': "body", name: "body", tabindex: 101}).ref('body');

      label({'for': "details"}, "Further Details")
      textarea({'class': "details", name: "details", tabindex: 102}).ref('details');

      input({tabindex: 103, 'type': 'submit', 'class': "button", value: "Ask Question", tabindex: 103}).ref('submit');
    }).ref('form').submit('create');
  }},

  viewProperties: {
    attach: function() {
      this.find('textarea').elastic();
      this.body.keydown('return', this.hitch('create'));
    },

    afterShow: function() {
      this.find('textarea').val("").keyup();
    },

    create: function() {
      if ($.trim(this.body.val()) === "") return false;
      
      Application.currentOrganization().elections().create(this.fieldValues())
        .success(function(election) {
          this.hide();
          History.pushState(null, null, election.url());
        }, this);
      return false;
    }
  }
});