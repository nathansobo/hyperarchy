require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Resources
  describe "routing" do
    attr_reader :dispatcher
    before do
      @dispatcher = Http::Dispatcher.instance
    end

    describe "/users" do
      it "maps to Resources::Users" do
        dispatcher.locate_resource("/users", "fake_session_id").should be_an_instance_of(Resources::Users) 
      end
    end

    describe "/login" do
      it "maps to Resources::Login" do
        dispatcher.locate_resource("/login", "fake_session_id").should be_an_instance_of(Resources::Login)
      end
    end

    describe "/user_repository" do
      use_fixtures

      it "returns a UserRepository for the current user" do
        repository = dispatcher.locate_resource("/user_repository", "nathan_session")
        repository.should be_an_instance_of(Resources::UserRepository)
        repository.user.should == User.find("nathan")
      end
    end
  end
end
