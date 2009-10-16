module Http
  class TestRequest < Http::Request
    def initialize
      super({})
    end
  end
end
