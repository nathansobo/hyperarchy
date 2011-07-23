require 'spec_helper'

describe TwitterConnectionsController do
  describe "#create" do
    let(:twitter_id) { 1234 }

    before do
      cookies["twitter_anywhere_identity"] = "#{twitter_id}:#{twitter_signature}"
    end

    describe "when a user is logged in" do
      before do
        login_as User.make(:twitter_id => nil)
      end

      describe "when the session validates against its signature" do
        let(:twitter_signature) { Digest::SHA1.hexdigest("#{twitter_id}#{TWITTER_SECRET}") }

        describe "when no users exist with the given twitter id" do
          it "associates the current user with the twitter id" do
            post :create
            current_user.twitter_id.should == twitter_id
            response_records.should include(current_user)
          end
        end

        describe "when a user already exists with the given twitter id" do
          attr_reader :other_user
          before do
            @other_user = User.make(:twitter_id => twitter_id)
          end

          it "associates the current user with the twitter id and sets the other user records twitter id to -1" do
            post :create, :twitter_id => twitter_id
            current_user.twitter_id.should == twitter_id
            other_user.twitter_id.should == -1
          end
        end
      end

      describe "when the session does not validate against its signature" do
        let(:twitter_signature) { "moonbeammoons" }

        it "responds with 403 forbidden" do
          post :create
          response.should be_forbidden
        end
      end
    end

    describe "when a guest is logged in" do
      let(:twitter_signature) { Digest::SHA1.hexdigest("#{twitter_id}#{TWITTER_SECRET}") }

      it "responds with 403 forbidden" do
        post :create
        response.should be_forbidden
      end
    end
  end
end
