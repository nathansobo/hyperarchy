require 'build_client_dataset'

class ApplicationController < ActionController::Base
  include BuildClientDataset

  protect_from_forgery

  before_filter :ensure_authenticated
  around_filter :manage_prequel_session

  helper_method :current_user_id, :current_user, :build_client_dataset

  def ensure_authenticated
    unless current_user
      session[:after_login_url] = request.url
      redirect_to authenticate_uri
    end
  end

  def authenticate_uri
    "/auth/#{AUTH_SCHEME}"
  end

  def current_user
    User.find(current_user_id)
  end

  def current_user_id
    session[:current_user_id]
  end

  def current_user=(user)
    self.current_user_id = user ? user.id : nil
  end

  def current_user_id=(id)
    session[:current_user_id] = id
  end

  def manage_prequel_session
    Prequel.session.current_user = current_user
    yield
  ensure
    Prequel.clear_session
  end
end
