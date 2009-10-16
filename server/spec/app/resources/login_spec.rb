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
          it "sets the current_user and returns a successful ajax response with the current_user_id" do
            resource.current_session.user.should be_nil
            response = Http::Response.new(*resource.post(:email_address => user.email_address, :password => "spectrum"))
            resource.current_session.user.should == user

            response.body_from_json.should == {
              "successful" => true,
              "data" => {
                "current_user_id" => user.id  
              }
            }
          end
        end

        context "if the given password does NOT match that User" do
          it "does not set the current_user and returns an unsuccessful ajax response with errors on password" do
            resource.current_session.user.should be_nil
            response = Http::Response.new(*resource.post(:email_address => user.email_address, :password => "incorrectpassword"))
            resource.current_session.user.should be_nil

            response.body_from_json.should == {
              "successful" => false,
              "data" => {
                "errors" => {
                  "password" => "Incorrect password for the given email address."
                }
              }
            }
          end
        end
      end

      context "if no User with the given email address exists" do
        it "does not set the current_user and returns an unsuccessful ajax response with errors on email_address" do
          resource.current_session.user.should be_nil
          response = Http::Response.new(*resource.post(:email_address => "bogus@example.com", :password => "spectrum"))
          resource.current_session.user.should be_nil

          response.body_from_json.should == {
            "successful" => false,
            "data" => {
              "errors" => {
                "email_address" => "No user exists with this email address."
              }
            }
          }
        end
      end
    end
  end
end