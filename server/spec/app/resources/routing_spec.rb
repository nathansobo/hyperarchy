require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Resources
  describe "routing" do
    attr_reader :resource_locator
    before do
      @resource_locator = Util::ResourceLocator.new
    end

    describe "/users" do
      it "maps to Resources::Users" do
        resource_locator.locate("/users", "fake_session_id").should be_an_instance_of(Resources::Users) 
      end
    end

    describe "/login" do
      it "maps to Resources::Login" do
        resource_locator.locate("/login", "fake_session_id").should be_an_instance_of(Resources::Login)
      end
    end

    describe "/user_repository" do
      use_fixtures

      it "returns a UserRepository for the current user" do
        repository = resource_locator.locate("/user_repository", :session_id => "nathan_session")
        repository.should be_an_instance_of(Resources::UserRepository)
        repository.user.should == User.find("nathan")
      end
    end
  end
end
