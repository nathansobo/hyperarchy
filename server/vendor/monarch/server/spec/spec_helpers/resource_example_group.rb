class Rack::MockResponse
  def body_from_json
    JSON.parse(body)
  end

  def ok?
    status == 200
  end
end

class ResourceExampleGroup < Spec::Example::ExampleGroup
  Spec::Example::ExampleGroupFactory.register(:resource, self)

  include Rack::Test::Methods
  include Warden::Test::Helpers

  after do
    Warden::test_reset!
  end

  def app
    Application
  end
end

