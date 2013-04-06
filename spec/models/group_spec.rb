module Models
  describe Group do
    describe "#add_member(user)" do
      it "makes the user a member of the group if they aren't already" do
        group = Group.make!
        user = User.make!
        group.add_member(user)
        group.add_member(user)
        user.memberships.count.should == 1
        user.groups.first.should == group
      end
    end
  end
end
