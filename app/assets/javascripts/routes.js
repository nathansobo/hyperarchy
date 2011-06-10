Path.map('/organizations/:id').to(function() {
  Application.organizationPage.show().organizationId(parseInt(this.params.id));
});
