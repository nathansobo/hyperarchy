_.constructor('Views.Pages.Organization', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div("Org View");
  }},

  viewProperties: {
    propertyAccessors: ['organizationId']
  }
});
