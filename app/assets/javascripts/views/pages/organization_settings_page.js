_.constructor('Views.Pages.OrganizationSettings', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: 'organization-settings'}, function() {

    });
  }},

  viewProperties: {
    propertyAccessors: ['params']
  }
});
