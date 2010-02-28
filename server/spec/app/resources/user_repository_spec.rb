require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Resources
  describe UserRepository, :type => :resource do
    describe "locating /user_repository" do
      use_fixtures

      it "returns a UserRepository for the current user" do
        user = User.find("nathan")
        authenticate user
        repository = locate("/user_repository")
        repository.should be_an_instance_of(Resources::UserRepository)
        repository.user.should == User.find("nathan")
      end
    end
  end
end
