require 'spec_helper'

module Prequel
  describe Backdoor do
    let(:backdoor) { Backdoor.new }

    before do
      class ::Blog < Prequel::Record
        column :id, :integer
        column :user_id, :integer
        column :title, :string
        column :secret_sauce, :string
        has_many :posts

        def read_blacklist
          [:secret_sauce]
        end

        def can_mutute?
          false
        end
      end

      class ::Post < Prequel::Record
        column :id, :integer
        column :blog_id, :integer
        column :title, :string
        column :decoder_ring, :string

        def read_blacklist
          [:decoder_ring]
        end

        def can_mutute?
          false
        end
      end
    end

    describe "#fetch" do
      attr_reader :blog_1, :blog_2, :blog_3, :post_1, :post_2, :post_3, :comment_1, :comment_2, :comment_3
      before do
        Blog.create_table
        Post.create_table

        @blog_1 = Blog.create(:user_id => 1)
        @blog_2 = Blog.create(:user_id => 2)
        @post_1 = blog_1.posts.create
        @post_2 = blog_1.posts.create
        @post_3 = blog_2.posts.create
      end

      context "for relations containing records" do
        it "returns a dataset with the contents of the requested relations, without masking any field values" do
          dataset = backdoor.fetch(Blog.wire_representation, Post.wire_representation)
          dataset.should == {
            'blogs' => {
              blog_1.to_param => blog_1.wire_representation(:ignore_security),
              blog_2.to_param => blog_2.wire_representation(:ignore_security)
            },
            'posts' => {
              post_1.to_param => post_1.wire_representation(:ignore_security),
              post_2.to_param => post_2.wire_representation(:ignore_security),
              post_3.to_param => post_3.wire_representation(:ignore_security)
            }
          }
        end
      end

      context "for relations containing composite tuples" do
        it "returns a dataset with their contents, decomposing the composite tuples into their components" do
          dataset = backdoor.fetch(Blog.join(Post).wire_representation)
          dataset.should == {
            'blogs' => {
              blog_1.to_param => blog_1.wire_representation(:ignore_security),
              blog_2.to_param => blog_2.wire_representation(:ignore_security)
            },
            'posts' => {
              post_1.to_param => post_1.wire_representation(:ignore_security),
              post_2.to_param => post_2.wire_representation(:ignore_security),
              post_3.to_param => post_3.wire_representation(:ignore_security)
            }
          }
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
          end

          it "returns the a '200 ok' response with the wire representation of the created record" do
            Post.should be_empty
            status, response = backdoor.create('posts', { 'blog_id' => 1, 'title' => 'Post Title' })
            status.should == 200
            response.should == Post.first.wire_representation
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
            status, response = backdoor.create('blogs', { 'user_id' => 1, 'title' => 'Blog Title' })
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

        context "when no record exists with the provided id" do
          it "returns '404 not found'" do
            status, response = backdoor.update('blogs', -1, { 'title' => "New Title" })
            status.should == 404
          end
        end

        context "when the record exists" do
          context "when the update leaves the record in a valid state" do
            it "returns '200 ok' with the unsecured wire representation of the updated record" do
              status, response = backdoor.update('blogs', blog.id, { 'title' => "New Title" })
              blog.reload.title.should == "New Title"
              status.should == 200
              response.should == blog.wire_representation(:ignore_security)
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
              status, response = backdoor.update('blogs', blog.id, { 'title' => "New Title" })
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

        context "when a record with the given id exists" do
          it "destroys the record and returns '200 ok'" do
            status, response = backdoor.destroy('blogs', blog.id)
            status.should == 200
            Blog.find(blog.id).should be_nil
          end
        end

        context "when no record with the given id exists" do
          it "returns '404 not found' and does not destroy the record" do
            status, response = backdoor.destroy('blogs', -1)
            status.should == 404
          end
        end
      end
    end
  end
end
