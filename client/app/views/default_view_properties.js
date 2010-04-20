Monarch.View.Template.extendDefaultViewProperties({
  ensureAuthenticated: function() {
    if (!Application.currentUserId) {
      jQuery.bbq.pushState({view: "login"});
      return false;
    } else {
      return true;
    }
  }
});