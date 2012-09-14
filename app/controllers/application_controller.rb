class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :ensure_authenticated
  before_filter :set_current_user_on_model

  def ensure_authenticated
    redirect_to authenticate_url unless current_user_id
  end

  def authenticate_url
    '/auth/github'
  end

  def current_user
    User.find(current_user_id)
  end

  def current_user_id
    session[:user_id]
  end

  def current_user=(user)
    self.current_user_id = user ? user.id : nil
  end

  def current_user_id=(id)
    session[:user_id] = id
  end

  def set_current_user_on_model
    Prequel.session.current_user = current_user
  end
end
