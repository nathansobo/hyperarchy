class SessionsController < ApplicationController
  skip_before_filter :ensure_authenticated

  def create
    auth = request.env["omniauth.auth"]
    self.current_user = user = User.find_or_create_with_omniauth(auth)

    redirect_to root_url
  end

  def destroy
    self.current_user = nil
    redirect_to root_url
  end
end
