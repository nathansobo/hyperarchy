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
          column :times_read, :integer
        end

        Blog.create_table
        Post.create_table
      end

      describe "#first" do
        it "returns the first element of the relation or nil if there is none" do
          Blog.first.should be_nil
          DB[:blogs] << { :id => 2 }
          Blog.first.id.should == 2
        end
      end

      describe "#find" do
        before do
          DB[:blogs] << { :id => 1, :title => "Blog 1" }
          DB[:blogs] << { :id => 2, :title => "Blog 2" }
        end

        it "when passed an integer, returns the record with that id or nil if it is not found" do
          Blog.find(1).title.should == "Blog 1"
          Blog.find(2).title.should == "Blog 2"
          Blog.find(99).should be_nil
        end

        it "when passed a hash, returns the record matching the corresponding predicate" do
          Blog.find(:title => "Blog 2").should == Blog.find(2)
        end

        it "when passed nil, returns nil" do
          Blog.find(nil).should be_nil
        end
      end

      describe "#join_through(right)" do
        it "joins to the operand and then projects through its surface table" do
          Blog.where(:user_id => 1).join_through(Post).should ==
            Blog.where(:user_id => 1).join(Post).project(Post)
        end

        it "handles selections on the right side" do
          Blog.where(:user_id => 1).join_through(Post.where(:title => "Hi!")).should ==
            Blog.where(:user_id => 1).join(Post.where(:title => "Hi!")).project(Post)
        end
      end

      describe "#increment(column_name, count=1)" do
        it "increments the given column by the given count" do
          post_1 = Post.create(:blog_id => 1, :times_read => 0)
          post_2 = Post.create(:blog_id => 1, :times_read => 1)
          post_3 = Post.create(:blog_id => 1, :times_read => 2)
          post_4 = Post.create(:blog_id => 2, :times_read => 7)

          Post.where(:blog_id => 1).increment(:times_read, 2)
          post_1.reload.times_read.should == 2
          post_2.reload.times_read.should == 3
          post_3.reload.times_read.should == 4
          post_4.reload.times_read.should == 7 # not in selection
        end
      end

      describe "#decrement(column_name, count=1)" do
        it "decrements the given column by the given count" do
          post_1 = Post.create(:blog_id => 1, :times_read => 3)
          post_2 = Post.create(:blog_id => 1, :times_read => 4)
          post_3 = Post.create(:blog_id => 1, :times_read => 5)
          post_4 = Post.create(:blog_id => 2, :times_read => 7)

          Post.where(:blog_id => 1).decrement(:times_read, 2)
          post_1.reload.times_read.should == 1
          post_2.reload.times_read.should == 2
          post_3.reload.times_read.should == 3
          post_4.reload.times_read.should == 7 # not in selection
        end
      end
    end
  end
end
