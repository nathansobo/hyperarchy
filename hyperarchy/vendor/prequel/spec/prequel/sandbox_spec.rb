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

    describe "Mutation methods" do
      before do
        Blog.create_table
      end

      describe "#create(relation_name, field_values)" do
        context "when the created record is valid" do
          attr_reader :blog_1, :blog_2
          before do
            Post.create_table
            @blog_1 = Blog.create(:user_id => 1)
            @blog_2 = Blog.create(:user_id => 2)
          end

          context "when the created record ends up being a member of the exposed relation" do
            it "returns the a '200 ok' response with the wire representation of the created record" do
              Post.should be_empty
              status, response = sandbox.create('posts', { 'blog_id' => blog_1.id, 'title' => 'Post Title' })
              status.should == 200
              response.should == Post.first.wire_representation
            end
          end

          context "when the created record does not end up being a member of the exposed relation" do
            it "raises a SecurityError and does not commit the transaction to create the record" do
              Post.should be_empty
              expect do
                sandbox.create('posts', { 'blog_id' => blog_2.id, 'title' => 'Post Title' })
              end.should raise_error(SecurityError)
              Post.should be_empty
            end
          end
        end

        context "when the created record is invalid" do
          before do
            class ::Blog
              def validate
                errors.add(:title, "Title must be in Spanish.")
                errors.add(:user_id, "User must be from Spain.")
              end
            end
          end

          it "returns a '422 unprocessable entity' with the validation errors" do
            Blog.should be_empty
            status, response = sandbox.create('blogs', { 'user_id' => 1, 'title' => 'Blog Title' })
            status.should == 422
            response.should == {
              :title => ["Title must be in Spanish."],
              :user_id => ["User must be from Spain."]
            }
          end
        end
      end

      describe "#update(relation_name, id, field_values)" do
        attr_reader :blog

        before do
          @blog = Blog.create!(:title => "Blog Title", :user_id => 1)
        end

        context "when a record with the given id is a member of the exposed relation" do
          context "when the update leaves the record in a valid state" do
            it "returns '200 ok' with the wire representation of the updated record" do
              status, response = sandbox.update('blogs', blog.id, { 'title' => "New Title" })
              blog.reload.title.should == "New Title"
              status.should == 200
              response.should == blog.wire_representation
            end
          end

          context "when the update leaves the record in an invalid state" do
            before do
              class ::Blog
                def validate
                  errors.add(:title, "Title must be in Spanish.")
                end
              end
            end

            it "returns '422 unprocessable entity' with the validation errors" do
              status, response = sandbox.update('blogs', blog.id, { 'title' => "New Title" })
              blog.reload.title.should == "Blog Title"
              status.should == 422
              response.should == blog.errors
            end
          end
        end
      end

      describe "#destroy(relation_name, id)" do
        attr_reader :blog

        before do
          @blog = Blog.create!(:title => "Blog Title", :user_id => 1)
        end

        context "when a record with the given id is a member of the exposed relation" do
          it "destroys the record and returns '200 ok'" do
            status = sandbox.destroy('blogs', blog.id)
            status.should == 200
            Blog.find(blog.id).should be_nil
          end
        end
      end
    end
  end
end
