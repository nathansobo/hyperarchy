module Views
  class RedirectToLogin < Views::Layout
    def analytics_enabled?
      false
    end
    
    def head_content
      javascript %[
        var redirectedFrom = encodeURIComponent(window.location.pathname + window.location.hash);
        window.location = "/login?redirected_from=" + redirectedFrom;
      ]
    end
  end
end