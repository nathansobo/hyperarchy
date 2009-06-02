module Resources
  class Users < Http::Resource
    def post(attributes)
      current_session.user_id = User.create.id
      [200, {}, ""]
    end
  end
end