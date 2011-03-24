require 'spec_helper'

describe "Machinist adaptor" do

  before do
    class Blog < Prequel::Record
      column :id, :integer
      column :title, :string
      has_many :posts

      create_table
    end

    class Post < Prequel::Record
      column :id, :integer
      column :blog_id, :integer
      column :title, :string

      belongs_to :blog

      create_table
    end

    Blog.blueprint do
      title { "Blog Title" }
    end

    Post.blueprint do
      blog { Blog.make }
      title { "Post Title" }
    end
  end

  describe "Record.make" do
    it "creates a record with a blueprint plus the specified attributes" do
      post = Post.make
      post.should be_persisted
      post.blog.should be_a(Blog)
      post.title.should == "Post Title"

      post_2 = Post.make(:title => "Override")
      post_2.title.should == "Override"

      blog = Blog.make
      post_3 = Post.make(:blog_id => blog.id)
      post_3.blog_id.should == blog.id

      # if the association is null, always overrides it
      post_4 = Post.make(:blog_id => 909)
      post_4.blog.should_not be_nil
      post_4.blog_id.should_not == 909
    end
  end

  describe "Relation#make" do
    it "creates a record with a blueprint, but does not override the default foreign key" do
      blog = Blog.make
      relation = blog.posts
      post = relation.make
      post.title.should == "Post Title"
      post.blog_id.should == blog.id
    end
  end
end