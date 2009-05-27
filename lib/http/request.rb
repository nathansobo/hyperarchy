module Http
  class Request
    attr_reader :env

    def initialize(env)
      @env = env
    end

    def cookies
      @cookies ||= Cookies.new(self)
    end

    def http_cookies
      env['HTTP_COOKIES']
    end

    def http_cookies=(cookie_string)
      env['HTTP_COOKIES'] = cookie_string
    end
    
    class Cookies
      attr_reader :request, :cookie_hash

      def initialize(request)
        @request = request
        @cookie_hash = parse_cookie_string
      end

      def [](key)
        cookie_hash[key]
      end

      def []=(key, value)
        cookie_hash[key] = value
        write_cookie_string
      end

      private
      def parse_cookie_string
        Rack::Utils.parse_query(request.http_cookies, ';,')
      end

      def write_cookie_string
        cookie_string = ""
        cookie_hash.each do |key, value|
          cookie_string += "#{key}=#{value}; "
        end
        request.http_cookies = cookie_string
      end
    end
  end
end