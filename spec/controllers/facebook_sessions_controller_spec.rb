require 'spec_helper'

describe FacebookSessionsController do
  describe "#create" do

    describe "when the session validates against its signature" do
      attr_reader :fb_user
      before do
        @fb_user = FbGraph::User.new('fake-fb-uid')
        stub(controller).fb_user { fb_user }
      end

      describe "when the current user is a guest" do
        describe "when a user with the given facebook uid already exists" do
          attr_reader :fb_user, :user

          before do
            @user = User.make(:facebook_id => 'fake-fb-uid')
          end

          it "sets the current user to the user with this uid and returns their initial dataset" do
            post :create
            current_user.should == user

            response_json['data']['current_user_id'].should == user.id
            response_records.should include(user.initial_repository_contents)
          end
        end

        describe "when NO user with the given facebook uid exists" do
          let(:user_attrs) { User.plan }

          before do
            mock(controller).fetch_fb_user
            stub(controller.fb_user).email { user_attrs[:email_address] }
            stub(controller.fb_user).first_name { user_attrs[:first_name] }
            stub(controller.fb_user).last_name { user_attrs[:last_name] }
          end

          describe "when no user exists with the same email address as the authenticating facebook account" do
            it "creates and authenticates a new user with details from the facebook graph api" do
              expect {
                post :create
              }.to change(User, :count).by(1)

              new_user = User.find(:email_address => user_attrs[:email_address])
              current_user.should == new_user
              new_user.first_name.should == user_attrs[:first_name]
              new_user.last_name.should == user_attrs[:last_name]
              new_user.facebook_id.should == fb_user.identifier

              response_json['data']['current_user_id'].should == new_user.id
              response_records.should include(new_user.initial_repository_contents)
            end
          end

          describe "when a user exists with the same email address as the authenticating facebook account, but is not yet associated with this uid" do
            attr_reader :user
            before do
              @user = User.make(user_attrs)
            end

            it "assigns the uid to the existing user and authenticates them" do
              expect {
                post :create
              }.to_not change(User, :count)

              current_user.should == user
              user.first_name.should == user_attrs[:first_name]
              user.last_name.should == user_attrs[:last_name]
              user.facebook_id.should == fb_user.identifier

              response_json['data']['current_user_id'].should == user.id
              response_records.should include(user.initial_repository_contents)
            end
          end

          describe "when a share code is assigned in the session" do
            it "associates the user with the referring share corresponding to the code" do
              session[:share_code] = "sharecode87"
              share = Share.create!(:code => "sharecode87", :question_id => 99, :service => "twitter", :user_id => User.make.id)

              expect {
                post :create
              }.to change(User, :count).by(1)

              response.should be_success
              current_user.referring_share.should == share
            end
          end
        end
      end
    end

    describe "when the session does not validate against its signature" do
      before do
        mock(controller).fb_user { raise FbGraph::Auth::VerificationFailed.new(401, nil) }
      end

      it "returns 403 forbidden" do
        post :create
        response.should be_forbidden
      end
    end
  end
end
