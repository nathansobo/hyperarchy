module Http
  class TestRequest < Http::Request
    def initialize()
      super({"rack.session" => {}})
    end
  end
end