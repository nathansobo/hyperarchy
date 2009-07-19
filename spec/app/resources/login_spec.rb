require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Resources
  describe Login do
    attr_reader :resource

    before do
      @resource = Login.new
      resource.current_session_id = Session.create.id
    end

    describe "#post" do
      attr_reader :user

      before do
        @user = User.create(:email_address => "billy@example.com", :password => "spectrum")
      end

      context "if a User with the given email address exists" do
        context "if the given password matches that User" do
          it "sets the current_user" do

          end

        end

        context "if the given password does NOT match that User" do

        end
      end

      context "if no User with the given email address exists" do

      end


      it "finds the User with the given email address, and assigns it to the current Session if the password matches " do
        params = {
          :email_address => 'nathan@example.com',
          :full_name => "Nathan Sobo",
          :password => "password"
        }

        created_user = nil
        mock.proxy(User).create(params) do |user|
          created_user = user
        end

        response = Http::Response.new(*resource.post(params))

        created_user.email_address.should == 'nathan@example.com'
        created_user.full_name.should == 'Nathan Sobo'
        created_user.password.should == 'password'

        response.status.should == 200
        response.body_as_json.should == {
          "successful" => true,
          "data" => {
            "current_user_id" => created_user.id  
          }
        }

        resource.current_session.user.should == created_user
        resource.current_session.should_not be_dirty
      end
    end
  end
end