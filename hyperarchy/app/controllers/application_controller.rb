class ApplicationController < ActionController::Base
  protect_from_forgery
  layout false
  helper_method :current_user

  before_filter :initialize_local_identity_map
  before_filter :set_current_user_on_model
  after_filter :clear_local_identity_map

  protected

  rescue_from SecurityError do
    render :status => :forbidden, :text => "That's not allowed"
  end

  def set_current_user_on_model
    return unless current_user
    Monarch::Model::Repository.current_user = current_user
  end

  def initialize_local_identity_map
    Monarch::Model::Repository.initialize_local_identity_map
  end

  def clear_local_identity_map
    Monarch::Model::Repository.clear_local_identity_map
  end

  def set_current_user(user)
    session[:current_user_id] = user.id
    set_current_user_on_model
  end

  def clear_current_user
    session[:current_user_id] = nil
    Monarch::Model::Repository.current_user = nil
  end

  def current_user_id
    session[:current_user_id]
  end

  def current_user
    current_user_id ? User.find(current_user_id) : nil
  end

  def render_success_json(data=nil, dataset=nil)
    render :json => {
      :successful => true,
      :data => data,
      :dataset => dataset_json(dataset)
    }
  end

  def render_failure_json(data)
    render :json => {
      :successful => false,
      :data => data,
    }
  end

  def dataset_json(records_or_relations)
    {}.tap do |dataset|
      Array(records_or_relations).flatten.each do |r|
        r.add_to_relational_dataset(dataset)
      end
    end
  end
end
