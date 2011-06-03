class PasswordResetRequestsController < ApplicationController
  def new
  end

  def create
    if user = User.find(:email_address => params[:email_address])
      user.generate_password_reset_token
      UserMailer.password_reset(user).deliver
    else
      flash[:errors] = ["We couldn't find a user with that email address"]
      @email_address = params[:email_address]
      render :template => '/password_reset_requests/new'
    end
  end
end
