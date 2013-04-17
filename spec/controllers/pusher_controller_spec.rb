require 'spec_helper'

describe PusherController do
  describe "#auth" do
    describe "when authenticating to a group channel" do
      it "only allows members of a group to authenticate to its private channel" do
        group = Group.make!
        member = User.make!
        non_member = User.make!
        group.add_member(member)

        login_as(member)
        post :auth, :channel_name => "private-group-#{group.id}", :socket_id => "123"
        response.status.should == 200

        login_as(non_member)
        post :auth, :channel_name => "private-group-#{group.id}", :socket_id => "123"
        response.status.should == 403

        post :auth, :channel_name => "private-group-0", :socket_id => "123"
        response.status.should == 404
      end
    end

    describe "when authenticating to a personal channel" do
      it "only allows the user to authenticate to their own channel" do
        user = User.make!
        other_user = User.make!

        login_as(user)
        post :auth, :channel_name => "private-user-#{user.id}", :socket_id => "123"
        response.status.should == 200

        post :auth, :channel_name => "private-user-#{other_user.id}", :socket_id => "123"
        response.status.should == 403
      end
    end
  end
end
