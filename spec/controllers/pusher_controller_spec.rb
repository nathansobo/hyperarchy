require 'spec_helper'

describe PusherController, :f do
  describe "#auth" do
    it "only allows members of a group to authenticate to its private channel", :f do
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
end
