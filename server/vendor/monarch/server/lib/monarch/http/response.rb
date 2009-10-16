module Http
  class Response
    attr_reader :status, :headers, :body

    def initialize(status, headers, body)
      @status, @headers, @body = status, headers, body
    end

    def ok?
      status == 200
    end

    def cookies
      @cookies ||= Cookies.new(self)
    end

    def to_a
      [status, headers, body]
    end

    def body_from_json
      JSON.parse(body)
    end

    class Cookies
      attr_reader :response, :cookie_hash

      def initialize(response)
        @response = response
        @cookie_hash = parse_set_cookie_headers
      end

      def [](key)
        cookie_hash[key]
      end

      def []=(key, value)
        cookie_hash[key] = value
        write_set_cookie_headers
      end

      private
      def parse_set_cookie_headers
        cookie_hash = {}
        Array(response.headers['Set-Cookie']).each do |cookie_header|
          key, value = cookie_header.split("=")
          cookie_hash[Rack::Utils.unescape(key)] = Rack::Utils.unescape(value)
        end
        cookie_hash
      end

      def write_set_cookie_headers
        set_cookie_headers = []
        cookie_hash.each do |key, value|
          set_cookie_headers.push("#{Rack::Utils.escape(key)}=#{Rack::Utils.escape(value)}")
        end
        response.headers['Set-Cookie'] = set_cookie_headers 
      end
    end
  end
end
