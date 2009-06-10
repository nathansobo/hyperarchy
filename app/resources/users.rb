module Resources
  class Users < Http::Resource
    def post(attributes)
      current_session.user_id = User.create.id
      current_session.save
      [200, {}, ""]
    end
  end
end