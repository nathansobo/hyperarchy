//= require spec/spec_helper

describe("Views.Layout.LoginForm", function() {

  var view, darkenedBackground;
  beforeEach(function() {
    $("#jasmine_content").html(window.Application = Views.Layout.toView());
    Application.attach();
    view = Application.loginForm;
    darkenedBackground = Application.darkenedBackground;
    expect(view).toExist();
  });

  describe("#afterShow", function() {
    it("shows the darkened background", function() {
      expect(view).toBeHidden();
      expect(darkenedBackground).toBeHidden();
      view.show();
      expect(view).toBeVisible();
      expect(darkenedBackground).toBeVisible();
    });
  });
});
