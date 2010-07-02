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
      redirect "/login?redirected_from=#{request.fullpath}"
      halt
    end

    def validate_invitation_code(invitation_code)
      invitation = Invitation.find(:guid => invitation_code)

      if !invitation
        flash[:invalid_invitation_code] = true
        redirect "/signup"
        return false
      end

      if invitation.redeemed?
        flash[:already_redeemed] = true
        redirect "/signup"
        return false
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