class SessionsController < ApplicationController
  skip_before_filter :ensure_authenticated

  def create
    auth = request.env["omniauth.auth"]
    self.current_user = User.from_omniauth(auth)
    redirect_to session[:after_login_url] || root_url
  end

  def destroy
    self.current_user = nil
    redirect_to root_url
  end
end
