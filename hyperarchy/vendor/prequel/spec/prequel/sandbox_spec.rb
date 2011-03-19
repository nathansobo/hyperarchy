require 'spec_helper'

module Prequel
  describe Sandbox do
    attr_reader :sandbox

    before do
      class ::Blog < Prequel::Record
        column :id, :integer
        column :user_id, :integer
        column :title, :string

        has_many :posts
      end

      class ::Post < Prequel::Record
        column :id, :integer
        column :blog_id, :integer
        column :title, :string

        has_many :comments
      end

      class ::Comment < Prequel::Record
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


    describe "#fetch(*relation_wire_representations)" do
      attr_reader :blog_1, :blog_2, :blog_3, :post_1, :post_2, :post_3, :comment_1, :comment_2, :comment_3
      before do
        Blog.create_table
        Post.create_table
        Comment.create_table

        @blog_1 = Blog.create(:user_id => 1)
        @blog_2 = Blog.create(:user_id => 2)
        @post_1 = blog_1.posts.create
        @post_2 = blog_1.posts.create
        @post_3 = blog_2.posts.create
        @comment_1 = post_1.comments.create
        @comment_2 = post_2.comments.create
        @comment_3 = post_3.comments.create
      end

      context "for relations containing records" do
        it "returns a dataset with the contents of the requested relations" do
          dataset = sandbox.fetch(Blog.wire_representation, Comment.wire_representation)
          dataset.should == {
            'blogs' => {
              blog_1.to_param => blog_1.wire_representation
            },
            'comments' => {
              comment_1.to_param => comment_1.wire_representation,
              comment_2.to_param => comment_2.wire_representation
            }
          }
        end
      end

      context "for relations containing composite tuples" do
        it "returns a dataset with their contents, decomposing the composite tuples into their components" do
          dataset = sandbox.fetch(Post.join(Comment).wire_representation)
          dataset.should == {
            'posts' => {
              post_1.to_param => post_1.wire_representation,
              post_2.to_param => post_2.wire_representation
            },
            'comments' => {
              comment_1.to_param => comment_1.wire_representation,
              comment_2.to_param => comment_2.wire_representation
            }
          }

        end
      end
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
