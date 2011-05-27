require 'spec_helper'

describe ChannelSubscriptionsController do
  describe "#create" do

    let(:organization) { Organization.make }

    context "when the user is a member of the organization being subscribed to" do
      it "posts a channel subscription to the websockets server with the given client session id" do
        organization.update!(:privacy => 'private')
        user = organization.make_member
        login_as(user)

        mock(controller).post(organization.subscribe_url, :params => {:session_id => "fake_session_id"})
        post :create, :id => organization.id, :session_id => "fake_session_id"
        response.should be_success
      end
    end

    context "when the user is NOT a member of the organization being subscribed to" do
      before do
        user = User.make
        login_as(user)
        url = "http://#{SOCKET_SERVER_HOST}/channel_subscriptions/organizations/#{organization.id}"
      end

      context "when the organization is private" do
        it "returns a status of 403: forbidden" do
          organization.update!(:privacy => "private")
          post :create, :id => organization.id, :session_id => "fake_session_id"
          response.should be_forbidden
        end
      end

      context "when the organization is not private" do
        it "posts a channel subscription to the websockets server with the given client session id" do
          organization.update!(:privacy => 'public')
          mock(controller).post(organization.subscribe_url, :params => {:session_id => "fake_session_id"})
          post :create, :id => organization.id, :session_id => "fake_session_id"
          response.should be_success
        end
      end
    end
  end
end
