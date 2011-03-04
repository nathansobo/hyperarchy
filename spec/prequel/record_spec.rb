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
  end
end
