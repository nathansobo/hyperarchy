module ControllerSpecMethods
  def login_as(user)
    session[:current_user_id] = user.id
    user
  end

  def logout
    session[:current_user_id] = nil
  end

  def current_user_id
    controller.send(:current_user_id)
  end

  def current_user
    controller.send(:current_user)
  end

  def response_json
    @response_json ||= ActiveSupport::JSON.decode(response.body)
  end
end