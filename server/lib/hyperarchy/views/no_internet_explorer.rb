module Views
  class NoInternetExplorer < Views::Layout
    def analytics_enabled?
      false
    end

    def head_content
      style %[
        html { background: #ccc; }
        body { font-size: 24px; } 
        #sorryWrapper { text-align: center; }
        #sorry { margin: 20px auto; width: 600px; background: white; padding: 30px;}
        img { margin-bottom: 30px; } 
        h1 { text-align: left; margin-bottom: 20px; color: #790001;}
        p { margin-bottom: 20px; text-align: left; }

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

      div :id => :sorryWrapper do
        div :id => :sorry do
          img :src => "/images/logo_medium.png"

          h1 "To view this site in Internet Explorer, you need to install a plugin from Google that enables advanced browser technologies."
          p do
            a "Click here to install the Google Chrome Frame plugin", :onClick => "return installCF();", :href => "#"
          end

          p do
            text "It's free and will install in less than a minute."
          end
        end
      end
    end
  end
end