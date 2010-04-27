module Hyperarchy
  module Helpers
    def current_user
      warden.user
    end

    def warden
      @warden ||= request.env['warden']
    end

    def render_page(template, params={})
      template.new(params.merge(:current_user => current_user)).to_pretty
    end
  end
end