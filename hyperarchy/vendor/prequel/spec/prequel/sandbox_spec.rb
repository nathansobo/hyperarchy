require 'spec_helper'

module Prequel
  describe Sandbox do
    attr_reader :sandbox

    before do
      class Blog < Prequel::Record
        column :id, :integer
        column :user_id, :integer
        column :title, :string
      end

      class Post < Prequel::Record
        column :id, :integer
        column :blog_id, :integer
        column :title, :string
      end

      class Comment < Prequel::Record
        column :id, :integer
        column :post_id, :integer
        column :body, :string
      end


      class TestSandbox < Sandbox
        expose :blogs do
          Blog.where(:user_id => 1)
        end

        expose :posts do
          blogs.join_through(Post)
        end

        expose :comments do
          posts.join_through(Comment)
        end
      end

      @sandbox = TestSandbox.new
    end

    describe "#evaluate(relation_wire_representation)" do
      context "when given a table wire representation" do
        it "translates it to the corresponding exposed relation" do
          relation = sandbox.evaluate(Comment.wire_representation)
          relation.should == Blog.where(:user_id => 1).join_through(Post).join_through(Comment)
        end
      end

      context "when given a selection wire representation" do
        it "translates it to a selection with its table replaced by the exposed relation by that name" do
          relation = sandbox.evaluate(Post.where(:title => "Fun").wire_representation)
          relation.should == sandbox.posts.where(:title => "Fun")
        end
      end

      context "when given an inner join wire representation" do
        it "translates it to an inner join with its tables replaced by the corresponding exposed relations" do
          relation = sandbox.evaluate(Post.where(:title => "Fun").join(Comment).wire_representation)
          relation.to_sql.should == sandbox.posts.where(:title => "Fun").join(sandbox.comments).to_sql
        end
      end

      context "when given a projection wire representation" do
        it "translates it to an inner join with its tables replaced by the corresponding exposed relations" do
          relation = sandbox.evaluate(Post.where(:title => "Fun").join_through(Comment).wire_representation)
          relation.to_sql.should == sandbox.posts.where(:title => "Fun").join(sandbox.comments).project(Comment).to_sql
        end
      end
    end
  end
end
