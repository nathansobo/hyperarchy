require "rack/test"

class Rack::MockResponse
  def body_from_json
    JSON.parse(body)
  end

  def ok?
    status == 200
  end
end

class RackExampleGroup < Spec::Example::ExampleGroup
  Spec::Example::ExampleGroupFactory.register(:rack, self)
  include Rack::Test::Methods
#  include Warden::Test::Helpers
#
#  after do
#    Warden::test_reset!
#  end
end