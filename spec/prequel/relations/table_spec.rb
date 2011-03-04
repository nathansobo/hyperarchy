require 'spec_helper'

module Prequel
  module Relations
    describe Table do
      before do
        class Blog < Prequel::Record
          column :id, :integer
          column :user_id, :integer
          column :title, :string
        end
      end

      describe "#get_column(name)" do
        it "handles qualified column names" do
          Blog.get_column(:blogs__id).should == Blog.table.columns_by_name[:id]
          Blog.get_column(:posts__id).should be_nil
          Blog.get_column(:blogs__garbage).should be_nil
        end

        it "handles unqualified column names" do
          Blog.get_column(:id).should == Blog.table.columns_by_name[:id]
          Blog.get_column(:garbage).should be_nil
        end
      end

      describe "#all" do
        before do
          Blog.create_table
        end

        it "returns all records as instances of the table's tuple class" do
          DB[:blogs] << { :user_id => 1, :title => "Blog 1" }
          DB[:blogs] << { :user_id => 2, :title => "Blog 2" }

          blogs = Blog.all
          blogs.size.should == 2
          blogs[0].should be_a(Blog)
          blogs[0].user_id.should == 1
          blogs[0].title.should == "Blog 1"
          blogs[1].should be_a(Blog)
          blogs[1].user_id.should == 2
          blogs[1].title.should == "Blog 2"
        end
      end

      describe "#to_sql" do
        it "generates the appropriate SQL" do
          Blog.to_sql.should be_like_query("select * from blogs")
        end
      end
    end
  end
end