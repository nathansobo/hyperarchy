class ApplicationController < ActionController::Base
  include GuidGeneration

  layout false
  protect_from_forgery
  helper_method :current_user, :build_client_dataset, :make_guid
  around_filter :manage_session

  protected

  rescue_from SecurityError do
    render :status => :forbidden, :text => "That's not allowed"
  end

  def manage_session
    Prequel.session.current_user = current_user if current_user
    yield
  ensure
    Prequel.clear_session
  end

  def set_current_user(user)
    session[:current_user_id] = user.id
    Prequel.session.current_user = user
  end

  def clear_current_user
    session[:current_user_id] = nil
    Prequel.session.current_user = nil
  end

  def current_user_id
    session[:current_user_id]
  end

  def current_user
    current_user_id ? User.find(current_user_id) : nil
  end

  def require_authentication
    if current_user && !current_user.guest?
      true
    else
      raise SecurityError if request.xhr?
      clear_current_user
      session[:after_login_path] = request.path_info
      redirect_to login_url
      false
    end
  end

  def allow_guests
    set_current_user(User.guest) unless current_user
  end

  def render_success_json(data=nil, dataset=[])
    render :json => {
      :successful => true,
      :data => data,
      :dataset => build_client_dataset(*dataset)
    }
  end

  def render_failure_json(data)
    render :json => {
      :successful => false,
      :data => data,
    }
  end

  def build_client_dataset(*records_or_relations)
    (Hash.new {|h,k| h[k] = {}}).tap do |dataset|
      Array(records_or_relations).flatten.each do |r|
        r.add_to_client_dataset(dataset)
      end
    end
  end

  def post(url, options={})
    Typhoeus::Request.post(url, options)
  end

  def delete(url, options={})
    Typhoeus::Request.delete(url, options)
  end
end
