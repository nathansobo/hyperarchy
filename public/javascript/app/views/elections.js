constructor("Views.Elections", View.Template, {
  content: function() { with(this.builder) {
    div({id: 'elections_view'}, function() {
      h2("Elections");
    });
  }}
});