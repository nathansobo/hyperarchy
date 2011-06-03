require 'spec_helper'

module Prequel
  describe CompositeTuple do
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
      Post.create_table

      DB[:blogs] << { :id => 1, :title => "Blog 1" }
      DB[:posts] << { :id => 1, :blog_id => 1, :title => "Blog 1, Post 1" }
    end

    describe "#[](table_or_field_name)" do
      subject { Blog.join(Post, Blog[:id] => :blog_id).all.first }

      it "returns the record or field value for the given name" do
        subject[:blogs].should == Blog.find(1)
        subject[:title].should == Blog.find(1).title
        subject[:posts__title].should == Post.find(1).title
      end
    end

    describe "#get_record(table_name)" do
      subject { Blog.join(Post, Blog[:id] => :blog_id).all.first }

      it "returns the record associated with the given table name or nil if none exists" do
        subject.get_record(:blogs).should == Blog.find(1)
        subject.get_record(:posts).should == Post.find(1)
        subject.get_record(:elves).should be_nil
      end
    end

    describe "#get_field_value(field_name)" do
      subject { Blog.join(Post, Blog[:id] => :blog_id).all.first }

      it "if given an unqualified name, returns the value of the leftmost field with that name" do
        subject.get_field_value(:title).should == Blog.find(1).title
      end

      it "if given a qualified name, returns the value of the field with that name from the specified record" do
        subject.get_field_value(:posts__title).should == Post.find(1).title
        subject.get_field_value(:posts__junk).should be_nil
        subject.get_field_value(:junk__title).should be_nil
      end

      context "if the composite tuple contains records and non-record tuples (produced from a projection)" do
        subject { Blog.join(Post.project(:blog_id.as(:my_blog_id)), Blog[:id] => :my_blog_id).all.first }

        it "allows the fields of the non-record tuples to be accessed" do
          subject.get_field_value(:my_blog_id).should == 1
        end
      end
    end
  end
end