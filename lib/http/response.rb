module Http
  class Response
    attr_reader :status, :headers, :body

    def initialize(status, headers, body)
      @status, @headers, @body = status, headers, body
    end

    def cookies
      @cookies ||= Cookies.new(self)
    end

    class Cookies
      def initialize(response)
        
      end
    end
  end
end