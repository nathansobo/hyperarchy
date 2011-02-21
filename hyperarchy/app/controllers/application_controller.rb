class ApplicationController < ActionController::Base
  protect_from_forgery

  helper_method :current_user

  protected

  def set_current_user(user)
    session[:current_user_id] = user.id
  end

  def clear_current_user
    session[:current_user_id] = nil
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
      Array(records_or_relations).each do |r|
        r.add_to_relational_dataset(dataset)
      end
    end
  end
end
