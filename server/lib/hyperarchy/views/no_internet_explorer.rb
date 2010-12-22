module Views
  class NoInternetExplorer < Views::Layout
    def analytics_enabled?
      false
    end

    def head_content
      style %[
        html { background: #ccc; }
        body { font-size: 24px; } 
        #sorry { margin: 20px auto; width: 550px; background: white; padding: 30px;}
        h1 { margin-bottom: 10px; }
      ], :type => "text/css"
    end

    def body_content
      proto = request.env['HTTP_X_FORWARDED_PROTO'] || "http"
      script :type => "text/javascript", :src => "#{proto}://ajax.googleapis.com/ajax/libs/chrome-frame/1/CFInstall.min.js"
      javascript %[
        function installCF() {
          CFInstall.check({mode: "overlay"});
          return false; 
        }
      ]

      div :id => :sorry do
        h1 "Sorry! We don't support Internet Explorer yet."
        p do
          text "You can still use Hyperarchy by installing the "
          a "Google Chrome Frame", :id => "chromeFrame", :onClick => "return installCF();", :href => "#"
          text " plugin."
        end
      end
    end
  end
end