class SessionsController < ApplicationController
  def create
    auth = request.env["omniauth.auth"]
    self.current_user = User.find_or_create_with_omniauth(auth)
    redirect_to root_url
  end

  def destroy
    self.current_user = nil
    redirect_to root_url
  end
end
