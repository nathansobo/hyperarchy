require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "POST /login", :type => :rack do
  attr_reader :user

  before do
    @user = User.create(:email_address => "billy@example.com", :password => "spectrum")
  end

  context "if a User with the given email address exists" do
    context "if the given password matches that User" do
      it "sets the current_user and returns a successful ajax response with the current_user_id and the user record" do
        post "/login", :email_address => user.email_address, :password => "spectrum"

        last_response.should be_ok
        last_response.body_from_json.should == {
          "successful" => true,
          "data" => {
            "current_user_id" => user.id
          },
          "dataset" => {
            "users" => {
              user.id.to_s => user.wire_representation
            }
          }
        }
      end
    end

    context "if the given password does NOT match that User" do
      it "does not set the current_user and returns an unsuccessful ajax response with errors on password" do
        post "/login", :email_address => user.email_address, :password => "incorrectpassword"

        last_response.should be_ok
        last_response.body_from_json.should == {
          "successful" => false,
          "data" => {
            "errors" => {
              "email_address" => nil,
              "password" => ["Incorrect password."]
            }
          }
        }
      end
    end
  end

  context "if no User with the given email address exists" do
    it "does not set the current_user and returns an unsuccessful ajax response with errors on email_address" do
      post "/login", :email_address => "bogus@example.com", :password => "spectrum"

      last_response.should be_ok
      last_response.body_from_json.should == {
        "successful" => false,
        "data" => {
          "errors" => {
            "email_address" => ["No user found with that email address."],
            "password" => nil
          }
        }
      }
    end
  end
end