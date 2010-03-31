_.constructor("Views.ErrorList", View.Template, {
  content: function(errors) { with(this.builder) {
    ol({'class': 'errorList'}, function() {
      _.each(errors, function(attrErrors) {
        if (!attrErrors) return;
        _.each(attrErrors, function(errorMessag) {
          li(errorMessag);
        });
      })
    });
  }}
});

