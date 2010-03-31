module Resources
  class Users < Http::Resource
    def post(attributes)
      new_user = User.create(attributes)
      current_request.env['warden'].set_user(new_user)
      ajax_success("current_user_id" => new_user.id)
    end
  end
end