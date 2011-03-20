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

      describe "#update(attributes)" do
        before do
          Blog.create_table
          DB[:blogs] << { :user_id => 1, :title => "Blog 1" }
          DB[:blogs] << { :user_id => 2, :title => "Blog 2" }
          DB[:blogs] << { :user_id => 3, :title => "Blog 3" }
        end

        it "updates every record in the table and returns the count" do
          Blog.update(:user_id => 99, :title => "You're all mine!").should == 3

          blogs = Blog.all
          blogs.size.should == 3
          blogs.each do |blog|
            blog.user_id.should == 99
            blog.title.should == "You're all mine!"
          end
        end
      end

      describe "#to_sql" do
        it "generates the appropriate SQL" do
          Blog.to_sql.should be_like_query("select * from blogs")
        end
      end

      describe "#to_update_sql(attributes)" do
        it "generates the appropriate update SQL for simple updates" do
          Blog.to_update_sql(:user_id => 22, :title => "New Title").should be_like_query(%{
            update blogs set user_id = :v1, title = :v2
          }, :v1 => 22, :v2 => "New Title")
        end

        it "generates the appropriate update SQL for updates involving more complex expressions" do
          Blog.to_update_sql(:user_id => :user_id + 1).should be_like_query(%{
            update blogs set user_id = user_id + :v1
          }, :v1 => 1)

          Blog.to_update_sql(:user_id => :user_id - 1).should be_like_query(%{
            update blogs set user_id = user_id - :v1
          }, :v1 => 1)
        end
      end

      describe "#wire_representation" do
        it "returns a JSON representation that can be evaluated in a sandbox" do
          Blog.wire_representation.should == {
            'type' => 'table',
            'name' => 'blogs'
          }
        end
      end
    end
  end
end