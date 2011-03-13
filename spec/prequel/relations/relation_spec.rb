require 'spec_helper'

module Prequel
  module Relations
    describe "Behavior provided by the abstract Relation class" do
      before do
        class Blog < Record
          column :id, :integer
          column :title, :string
        end

        class Post < Record
          column :id, :integer
          column :blog_id, :integer
          column :title, :string
        end

        Blog.create_table
      end

      describe "#first" do
        it "returns the first element of the relation or nil if there is none" do
          Blog.first.should be_nil
          DB[:blogs] << { :id => 2 }
          Blog.first.id.should == 2
        end
      end

      describe ".find(id)" do
        before do
          DB[:blogs] << { :id => 1, :title => "Blog 1" }
          DB[:blogs] << { :id => 2, :title => "Blog 2" }
        end

        it "returns the record with that id or nil if it is not found" do
          Blog.find(1).title.should == "Blog 1"
          Blog.find(2).title.should == "Blog 2"
          Blog.find(99).should be_nil
        end
      end

      describe "#join_through(right)" do
        it "joins to the operand and then projects through its surface table" do
          Blog.where(:user_id => 1).join_through(Post).should ==
            Blog.where(:user_id => 1).join(Post).project(Post)
        end
      end
    end
  end
end
