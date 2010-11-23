module Views
  class Layout < Erector::Widget
    include Monarch::Util::BuildRelationalDataset

    GOOGLE_ANALYTICS_CODES = {
      "production" => 'UA-19678731-1',
      "demo" => 'UA-19678731-2',
      "development" => 'UA-19678731-3'
    }

    MIXPANEL_CODES = {
      "production" => 'f75e7802da27692104957ff1af6c2847',
      "demo" => 'dbf5ec251d715d9fc674a01c9db17ebd',
      "development" => 'a946479bf02e338e4da47b2f0fac1fec'
    }

    def content
      html do
        head do
          title "Hyperarchy"
          link :rel => "stylesheet", :type => "text/css", :href => "/stylesheets/hyperarchy.css"
          link :rel => "shortcut icon", :href => "/images/icon.png"

          head_content
          google_analytics_javascript
        end

        body :id => self.class.basename.underscore do
          body_content
        end

        below_body_content
        mixpanel_javascript
      end
    end

    def head_content
    end

    def body_content
    end

    def below_body_content
    end

    def store_in_repository(dataset)
      %{Repository.update(#{build_relational_dataset(dataset).to_json});}
    end

    def google_analytics_javascript
#      return unless RACK_ENV == "production"

      javascript %[
        var trackPageviewManually = #{track_pageview_manually.inspect};
        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', '#{GOOGLE_ANALYTICS_CODES[RACK_ENV]}']);
        _gaq.push(['_setAllowAnchor', true]);
        if (!trackPageviewManually) _gaq.push(['_trackPageview']);

        (function() {
          var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
          ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
          var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        })();
      ]
    end

    def track_pageview_manually
      false
    end

    def mixpanel_javascript
#      unless RACK_ENV == "production"
#        javascript %[ var mpq = []; ]
#        return
#      end

      javascript %[
        var mpq = [];
        mpq.push(["init", "#{MIXPANEL_CODES[RACK_ENV]}"]);
        (function() {
          var mp = document.createElement("script"); mp.type = "text/javascript"; mp.async = true;
          mp.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') + "//api.mixpanel.com/site_media/js/api/mixpanel.js";
          var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(mp, s);
        })();
      ]
    end

    def javascript(text=nil, &block)
      script :type => "text/javascript", :language => "javascript" do
        rawtext text if text
        yield if block
      end
    end

    def javascript_include(*paths)
      GiftWrapper.require_js(*paths).each do |path|
        script :type => "text/javascript", :language => "javascript", :src => path
      end
    end

    def method_missing(method, *args, &block)
      if helpers && helpers.respond_to?(method)
        helpers.send(method, *args, &block)
      else
        super
      end
    end
  end
end
