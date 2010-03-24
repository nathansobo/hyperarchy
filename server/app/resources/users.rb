module Resources
  class Users < Http::Resource
    def post(attributes)
      new_user = User.create(attributes)
      current_session.update(:user => new_user)
      ajax_success("current_user_id" => new_user.id)
    end
  end
end