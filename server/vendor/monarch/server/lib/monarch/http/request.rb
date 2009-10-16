module Http
  class Request
    attr_reader :env

    def initialize(env)
      @env = env
    end

    def cookies
      @cookies ||= Cookies.new(self)
    end

    def path_info
      env['PATH_INFO']
    end

    def path_info=(path_info)
      env['PATH_INFO'] = path_info
    end

    def method
      env['REQUEST_METHOD'].downcase.to_sym
    end

    def method=(method)
      env['REQUEST_METHOD'] = method.to_s.upcase
    end

    def params
      if media_type == 'application/x-www-form-urlencoded'
        url_params.merge(body_params)
      else
        url_params
      end
    end

    def url_params
      Rack::Utils.parse_nested_query(query_string).symbolize_keys!
    end

    def body_params
      raise "Media type must be 'application/x-www-form-urlencoded' to parse body params" unless media_type == 'application/x-www-form-urlencoded'
      body_params = Rack::Utils.parse_nested_query(input.read).symbolize_keys!
      input.rewind
      body_params
    end

    def session_id
      env['hyperarchy.session_id']
    end

    def session_id=(session_id)
      env['hyperarchy.session_id'] = session_id
    end

    def cookie_string
      env['HTTP_COOKIE']
    end

    def cookie_string=(cookie_string)
      env['HTTP_COOKIE'] = cookie_string
    end

    def input
      env['rack.input']
    end

    def content_type
      @env['CONTENT_TYPE']
    end

    def query_string
      @env['QUERY_STRING']
    end

    def media_type
      content_type && content_type.split(/\s*[;,]\s*/, 2).first.downcase
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
        Rack::Utils.parse_query(request.cookie_string, ';,')
      end

      def write_cookie_string
        cookie_string = ""
        cookie_hash.each do |key, value|
          cookie_string += "#{key}=#{value}; "
        end
        request.cookie_string = cookie_string
      end
    end
  end
end
