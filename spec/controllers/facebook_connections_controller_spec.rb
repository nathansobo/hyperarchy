require 'spec_helper'

describe FacebookConnectionsController do
  describe "#create" do
    let(:facebook_id) { 1234 }

    describe "when a user is logged in" do
      before do
        login_as User.make(:facebook_id => nil)
      end

      describe "when the session validates against its signature" do
        attr_reader :fb_user, :facebook_id
        before do
          @facebook_id = 'fake-facebook-id'
          @fb_user = FbGraph::User.new(@facebook_id)
          stub(controller).fb_user { fb_user }
        end

        describe "when no user exists with the given facebook id" do
          it "associates the current user with the facebook id" do
            post :create
            current_user.facebook_id.should == facebook_id
            response_records.should include(current_user)
          end
        end

        describe "when a user already exists with the given facebook id" do
          attr_reader :other_user
          before do
            @other_user = User.make(:facebook_id => facebook_id)
          end

          it "associates the current user with the facebook id and sets the other user records facebook id to 0" do
            post :create
            current_user.facebook_id.should == facebook_id
            other_user.facebook_id.should == 0
          end
        end
      end

      describe "when the session does not validate against its signature" do
        before do
          mock(controller).fb_user { raise FbGraph::Auth::VerificationFailed.new(401, 'Facebook cookie signature invalid') }
        end

        it "returns 403 forbidden" do
          post :create
          response.should be_forbidden
        end
      end
    end

    describe "when a guest is logged in" do
      attr_reader :fb_user, :facebook_id
      before do
        @facebook_id = 'fake-facebook-id'
        @fb_user = FbGraph::User.new(@facebook_id)
        stub(controller).fb_user { fb_user }
      end

      it "responds with 403 forbidden" do
        post :create
        response.should be_forbidden
      end
    end
  end
end
