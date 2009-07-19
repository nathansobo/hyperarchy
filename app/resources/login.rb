module Resources
  class Login < Http::Resource
    def post(attributes)
#      new_user = User.create(attributes)
#      current_session.user_id = new_user.id
#      current_session.save
#      ajax_success("current_user_id" => new_user.id)
    end
  end
end