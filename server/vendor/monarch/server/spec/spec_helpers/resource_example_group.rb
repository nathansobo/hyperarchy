class ResourceExampleGroup < Spec::Example::ExampleGroup
  Spec::Example::ExampleGroupFactory.register(:resource, self)

  before do
    if respond_to?(:resource)
      resource.current_request = request
    end
  end

  attr_reader :response
  
  def request
    @request ||= Http::TestRequest.new
  end

  def current_session
    Session.find(Session[:session_id].eq(request.session_id))
  end

  def current_user
    current_session.user
  end

  def resource_locator
    @resource_locator ||= Util::ResourceLocator.new
  end

  def authenticate(user)
    current_session.update(:user => user)
  end

  def locate(path)
    request.path_info = path
    resource_locator.locate(request, nil)
  end

  def get(path, params = nil)
    stub_current_requets_params(params)
    @response = Http::Response.new(*locate(path).get(params))
  end

  def put(path, params = nil)
    stub_current_requets_params(params)
    @response = Http::Response.new(*locate(path).put(params))
  end

  def post(path, params = nil)
    stub_current_requets_params(params)
    @response = Http::Response.new(*locate(path).post(params))
  end

  def delete(path, params = nil)
    stub_current_requets_params(params)
    @response = Http::Response.new(*locate(path).delete(params))
  end

  def stub_current_requets_params(params)
    stub(request).params { params } if params
  end
end

