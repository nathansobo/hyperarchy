require 'spec_helper'

describe TwitterSessionsController do
  describe "#create" do
    let(:twitter_id) { 1234 }

    before do
      cookies["twitter_anywhere_identity"] = "#{twitter_id}:#{twitter_signature}"
    end

    describe "when the session validates against its signature" do
      let(:twitter_signature) { Digest::SHA1.hexdigest("#{twitter_id}#{TWITTER_SECRET}") }

      describe "when the current user is a guest" do
        describe "when a user with the given twitter id already exists" do
          attr_reader :user

          before do
            @user = User.make(:twitter_id => twitter_id)
          end

          it "sets the current user to the user with this twitter id and returns their initial dataset" do
            post :create
            current_user.should == user

            response_json['data']['current_user_id'].should == user.id
            response_records.should include(user.initial_repository_contents)
          end
        end

        describe "when NO user with the given twitter id exists" do
          describe "when no user exists with the same email address as the authenticating facebook account" do
            it "creates and authenticates a new user with details from the facebook graph api" do
              expect {
                post :create, :name => "Max Brunsfeld"
              }.to change(User, :count).by(1)

              new_user = User.find(:twitter_id => twitter_id)
              current_user.should == new_user
              new_user.first_name.should == "Max"
              new_user.last_name.should == "Brunsfeld"

              response_json['data']['current_user_id'].should == new_user.id
              response_records.should include(new_user.initial_repository_contents)
            end

            it "handles names with no last name" do
              post :create, :name => "Hyperarchy"
              new_user = User.find(:twitter_id => twitter_id)
              new_user.last_name.should == ""
            end

            it "handles names with a two-word last name" do
              post :create, :name => "Max Van Heusenblossom"
              new_user = User.find(:twitter_id => twitter_id)
              new_user.last_name.should == "Van Heusenblossom"
            end

          end
        end
      end
    end

    describe "when the session does not validate against its signature" do
      let(:twitter_signature) { "junk" }

      it "returns 403 forbidden" do
        post :create, :name => "Evil Doer"
        response.should be_forbidden
      end
    end
  end
end
