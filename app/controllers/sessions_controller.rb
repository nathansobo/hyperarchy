class SessionsController < ApplicationController
  def create
    if authenticate
      if request.xhr?
        render :json => {
          :data => { :current_user_id => current_user_id },
          :records => build_client_dataset(current_user.initial_repository_contents)
        }
      else
        redirect_to session.delete(:after_login_path) || root_url(:anchor => "view=organization&organizationId=#{current_user.default_organization.id}")
      end
    else
      if request.xhr?
        render :status => 422, :json => { :errors => authentication_errors }
      else
        flash[:errors] = authentication_errors
        redirect_to login_path
      end
    end
  end

  def destroy
    clear_current_user
    redirect_to root_path
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
