//= require ./lightbox

_.constructor('Views.Lightboxes.AddOrganizationForm', Views.Lightboxes.Lightbox, {
  id: "add-organization-form",

  lightboxContent: function() { with(this.builder) {
    form(function() {
      h2("What is your organization's name?");
      input().ref("name");
      input({value: "Add Organization", 'class': "button", type: "submit"}).ref("createButton");
    }).submit('create');
  }},

  viewProperties: {
    create: function() {
      if ($.trim(this.name.val()) === "") return false;
      Organization.create({name: this.name.val()}).success(function(organization) {
        History.pushState(null, null, organization.url());
        this.close();
      }, this);
      return false;
    }
  }
});

