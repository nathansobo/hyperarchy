_.constructor("Views.ErrorList", View.Template, {
  content: function(errors) { with(this.builder) {
    ol({'class': 'errorList'}, function() {
      for(var attribute in errors) {
        li(errors[attribute]);
      }
    });
  }}
});

