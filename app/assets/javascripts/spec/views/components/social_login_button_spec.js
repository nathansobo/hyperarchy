describe("Views.Components.SocialLoginButton", function() {
  var facebookButton, twitterButton, fb;
  beforeEach(function() {
    fb = window.FB;
    window.FB = undefined;
    renderLayout();
    facebookButton = Application.loginForm.show().facebookLoginButton;
    twitterButton = Application.loginForm.show().twitterLoginButton;
  });

  afterEach(function() {
    window.FB = fb;
  });

  it("assigns the class based on the service name", function() {
    expect(facebookButton).toHaveClass('facebook');
    expect(twitterButton).toHaveClass('twitter');
    expect(facebookButton).toHaveClass('disabled');
    expect(twitterButton).toHaveClass('disabled');
  });

  describe("#attach", function() {
    it("shows the spinner and says Loading (Service)", function() {
      expect(facebookButton.text()).toBe("Loading Facebook");
      expect(twitterButton.text()).toBe("Loading Twitter");
      expect(facebookButton.spinner).toBeVisible();
      expect(twitterButton.spinner).toBeVisible();
    });
  });

  describe("when the service javascript is loaded", function() {
    it("hides the spinner, removes the .disabled class and says 'Sign In With (Service)'", function() {
      Application.facebookInitialized();
      expect(facebookButton.text()).toBe("Sign In With Facebook");
      expect(facebookButton.spinner).toBeHidden();
      expect(facebookButton).not.toHaveClass('disabled');

      Application.twitterInitialized();
      expect(twitterButton.text()).toBe("Sign In With Twitter");
      expect(twitterButton.spinner).toBeHidden();
      expect(twitterButton).not.toHaveClass('disabled');
    });
  });
});
