module Resources
  class Login < Http::Resource
    def post(attributes)
      warden.logout
      if user = warden.authenticate
        ajax_success({ "current_user_id" => user.id }, user)
      else
        ajax_failure(:errors => { :email_address => warden.errors.on(:email_address), :password => warden.errors.on(:password) })
      end
    end

    def warden
      @warden ||= current_request.env['warden']
    end
  end
end