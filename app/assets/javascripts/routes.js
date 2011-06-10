Path.map('/organizations/:id').to(function() {
  Application.showPage('organization', this.params.id);
});

Path.map('/elections/:id').to(function() {
  Application.showPage('election', this.params.id);
});
