module Hyperarchy
  module Helpers
    def current_user
      warden.user
    end

    def warden
      @warden ||= request.env['warden']
    end

    def render_page(template, params={})
      template.new(params).to_s(:prettyprint => true, :helpers => self)
    end

    def authentication_required
      return if current_user
      halt render_page(Views::RedirectToLogin)
    end

    def allow_guests
      return if current_user
      warden.set_user(User.guest)
    end

    def no_internet_explorer
      if user_agent =~ /MSIE/ && user_agent !~ /chromeframe/
        halt render_page(Views::NoInternetExplorer)
      end
    end

    def user_agent
      request.env["HTTP_USER_AGENT"]
    end

    def use_ssl
      if request.env["HTTP_X_FORWARDED_PROTO"] == "http"
        redirect "https://" + request.host + request.fullpath
        halt
      end
    end

    def redirect_if_logged_in(redirect_guests=false)
      return if !current_user || (!redirect_guests && current_user.guest?)
      redirect "/app#view=organization&organizationId=#{current_user.default_organization.id}"
      halt
    end

    def validate_invitation_code(invitation_code)
      invitation = Invitation.find(:guid => invitation_code)
      
      if !invitation
        flash[:invalid_invitation_code] = invitation_code
        session.delete(:invitation_code)
        redirect "/signup"
        halt
      end

      if invitation.redeemed?
        flash[:already_redeemed] = invitation_code
        session.delete(:invitation_code)
        redirect "/login"
        halt
      end

      if invitation.memberships.empty?
        redirect "/"
        halt
      end

      invitation
    end

    def base_url
      scheme = request.scheme
      if (scheme == 'http' && request.port == 80 ||
          scheme == 'https' && request.port == 443)
        port = ""
      else
        port = ":#{request.port}"
      end
      "#{scheme}://#{request.host}#{port}#{request.script_name}"
    end
  end
end