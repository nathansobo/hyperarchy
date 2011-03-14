require 'spec_helper'

module Prequel
  describe Record do
    before do
      class Blog < Record
        column :id, :integer
        column :title, :string
      end
    end

    describe "when it is subclassed" do
      specify "the subclass gets associated with a table" do
        Blog.table.name.should == :blogs
        Blog.table.tuple_class.should == Blog
      end

      specify "accessor methods are assigned on the subclass for columns on the table" do
        b = Blog.new
        b.title = "Title"
        b.title.should == "Title"
      end
    end

    describe ".new(field_values)" do
      it "returns a record with the same id from the identity map if it exists" do
        Blog.create_table
        DB[:blogs] << { :id => 1, :title => "Blog 1" }

        blog = Blog.find(1)
        blog.id.should == 1
        Blog.find(1).should equal(blog)

        stub(Prequel).session { Session.new }
        
        Blog.find(1).should_not equal(blog)
      end
    end

    describe ".has_many(name)" do
      before do
        class ::Post < Record
          column :id, :integer
          column :blog_id, :integer
        end
      end

      it "gives records a one-to-many relation to the table with the given name" do
        Blog.has_many(:posts)
        blog = Blog.new(:id => 1)
        blog.posts.should == Post.where(:blog_id => 1)
      end
      
      it "accepts a class name" do
        Blog.has_many(:posts_with_another_name, :class_name => "Post")
        blog = Blog.new(:id => 1)
        blog.posts_with_another_name.should == Post.where(:blog_id => 1)
      end

      it "accepts an order by option" do
        Blog.has_many(:posts, :order_by => :id)
        blog = Blog.new(:id => 1)
        blog.posts.should == Post.where(:blog_id => 1).order_by(:id)

        Blog.has_many(:posts, :order_by => [:id, :blog_id.desc])
        blog.posts.should == Post.where(:blog_id => 1).order_by(:id, :blog_id.desc)
      end
    end
  end
end
