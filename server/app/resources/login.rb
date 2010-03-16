module Resources
  class Login < Http::Resource
    def post(attributes)
      if user = User.find(User[:email_address].eq(attributes[:email_address]))
        if user.password == attributes[:password]
          current_session.user_id = user.id
          current_session.save
          ajax_success({ "current_user_id" => user.id }, user)
        else
          ajax_failure(:errors => { :password => "Incorrect password for the given email address." })
        end
      else
        ajax_failure(:errors => { :email_address => "No user exists with this email address." })
      end
    end
  end
end