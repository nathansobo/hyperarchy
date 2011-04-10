class SessionsController < ApplicationController
  def create
    if authenticate
      render :json => {
        :data => { :current_user_id => current_user_id },
        :records => build_client_dataset(current_user.initial_repository_contents)
      }
    else
      render :status => 422, :json => { :errors => authentication_errors }
    end
  end

  def destroy
    clear_current_user
    head :ok
  end

  protected

  def authenticate
    user = User.find(:email_address => params[:user][:email_address])
    unless user
      authentication_errors.push("Sorry. We could't find a user with that email address.")
      return false
    end

    unless user.password == params[:user][:password]
      authentication_errors.push("Sorry. That password doesn't match our records.")
      return false
    end

    set_current_user(user)
    true
  end

  def authentication_errors
    @authentication_errors ||= []
  end
end
