module Views
  class Layout < Erector::Widget
    include Monarch::Util::BuildRelationalDataset

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
#      return unless RACK_ENV =~ /^(production|demo)$/
      property_id = case RACK_ENV
        when 'production'
          'UA-19678731-1'
        when 'demo'
          'UA-19678731-2'
        when 'development'
          'UA-19678731-3'
        end

      javascript %[
        var trackPageviewManually = #{track_pageview_manually.inspect};
        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', '#{property_id}']);
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
      if RACK_ENV == 'production'
        javascript %[var mp_protocol = (('https:' == document.location.protocol) ? 'https://' : 'http://'); document.write(unescape('%3Cscript src="' + mp_protocol + 'api.mixpanel.com/site_media/js/api/mixpanel.js" type="text/javascript"%3E%3C/script%3E')); </script> <script type='text/javascript'> try {  var mpmetrics = new MixpanelLib('f75e7802da27692104957ff1af6c2847'); } catch(err) { null_fn = function () {}; var mpmetrics = {  track: null_fn,  track_funnel: null_fn,  register: null_fn,  register_once: null_fn, register_funnel: null_fn }; }]
      else
        javascript %[null_fn = function () {}; var mpmetrics = {  track: null_fn,  track_funnel: null_fn,  register: null_fn,  register_once: null_fn, register_funnel: null_fn };]
      end
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
