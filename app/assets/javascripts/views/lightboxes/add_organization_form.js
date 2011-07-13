//= require ./lightbox

_.constructor('Views.Lightboxes.AddOrganizationForm', Views.Lightboxes.Lightbox, {
  id: "add-organization-form",

  lightboxContent: function() { with(this.builder) {
    form(function() {
      h2("What is your organization's name?");
      input().ref("name");
      input({value: "Add Organization", 'class': "button", type: "submit"}).ref("createButton");
    }).ref('form').submit('create');
  }},

  viewProperties: {
    create: function(e) {
      e.preventDefault();
      if ($.trim(this.name.val()) === "") return false;
      return Organization.create({name: this.name.val()}).success(function(organization) {
        organization.memberships({userId: Application.currentUserId()}).fetch().success(function() {
          History.pushState(null, null, organization.url());
          this.close();
        }, this);
      }, this);
    }
  }
});

