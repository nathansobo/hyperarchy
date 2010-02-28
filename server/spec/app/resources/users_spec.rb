require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Resources
  describe Users, :type => :resource do
    describe "#post" do
      it "creates a new User with the given email address, full name, and password and assigns it to the current Session" do
        params = {
          :email_address => 'nathan@example.com',
          :full_name => "Nathan Sobo",
          :password => "password"
        }

        created_user = nil
        mock.proxy(User).create(params) do |user|
          created_user = user
        end

        post "/users", params

        created_user.email_address.should == 'nathan@example.com'
        created_user.full_name.should == 'Nathan Sobo'
        created_user.password.should == 'password'

        response.should be_ok
        response.body_from_json.should == {
          "successful" => true,
          "data" => {
            "current_user_id" => created_user.id  
          }
        }

        current_user.should == created_user
        current_session.should_not be_dirty
      end
    end
  end
end