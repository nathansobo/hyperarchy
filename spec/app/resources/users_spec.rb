require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Resources
  describe Users do
    attr_reader :resource

    before do
      @resource = Users.new
      resource.current_session_id = Session.create.id
    end

    describe "#post" do
      it "creates a new User with the given email address, full name, and password and assigns it to the current Session" do
        created_user = nil
        mock.proxy(User).create do |user|
          created_user = user
        end

        response = Http::Response.new(*resource.post(
          :email_address => 'nathan@example.com',
          :full_name => "Nathan Sobo",
          :password => "password"
        ))
        response.status.should == 200

        resource.current_session.user.should == created_user
      end
    end
  end
end