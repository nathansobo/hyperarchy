module Views
  class NoInternetExplorer < Views::Layout
    def analytics_enabled?
      false
    end

    def head_content
    end

    def body_content
      script :type => "text/javascript", :src => "http://ajax.googleapis.com/ajax/libs/chrome-frame/1/CFInstall.min.js"
      javascript %[CFInstall.check({mode: "overlay"})]
      h1 "Sorry. We don't support internet explorer yet."
    end
  end
end