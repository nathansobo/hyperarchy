class PasswordResetsController < ApplicationController
  def new
    @token = params[:token]
    find_user_and_check_token
  end

  def create
    return unless user = find_user_and_check_token

    flash[:errors] = ["You must supply a password"] if params[:password].blank?
    flash[:errors] = ["Your password must match your password confirmation"] if params[:password] != params[:password_confirmation]

    if flash[:errors]
      @token = params[:token]
      render :template => '/password_resets/new'
      return
    end

    user.update(:password => params[:password])
    set_current_user(user)
    redirect_to(organization_url(user.default_organization))
  end

  protected

  def find_user_and_check_token
    user = User.find(:password_reset_token => params[:token])
    unless user && user.password_reset_token_generated_at > 1.hour.ago
      render :template => '/password_resets/expired'
      return false
    end
    user
  end
end
