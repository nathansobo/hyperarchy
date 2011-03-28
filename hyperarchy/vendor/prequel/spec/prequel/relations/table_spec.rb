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

      describe "on create/update/destroy methods" do
        attr_reader :create_events, :update_events, :destroy_events
        attr_reader :blog_1, :blog_2
        before do
          @create_events = []
          @update_events = []
          @destroy_events = []

          @blog_1 = Blog.create(:title => "Blog 1")
          @blog_2 = Blog.create(:title => "Blog 2")
        end

        def expect_no_events
          create_events.should be_empty
          update_events.should be_empty
          destroy_events.should be_empty
        end

        specify "callbacks are fired for events on the table only after the transaction completes" do
          Blog.on_create {|blog| create_events << blog }
          Blog.on_update {|blog, changeset| update_events << [blog, changeset] }
          Blog.on_destroy {|blog| destroy_events << blog }

          new_blog = nil
          Prequel.transaction do
            new_blog = Blog.create!(:title => "New Blog")
            expect_no_events
            new_blog.update(:title => "New Blog Prime")
            blog_1.update(:title => "Blog 1 Prime")
          end
        end
      end

      describe "#to_sql" do
        it "generates the appropriate SQL" do
          Blog.to_sql.should be_like_query("select blogs.id, blogs.user_id, blogs.title from blogs")
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
            update blogs set user_id = blogs.user_id + :v1
          }, :v1 => 1)

          Blog.to_update_sql(:user_id => :user_id - 1).should be_like_query(%{
            update blogs set user_id = blogs.user_id - :v1
          }, :v1 => 1)
        end
      end

      describe "#has_all_columns?(*column_names)" do
        it "returns true only if the table has all the given columns" do
          Blog.table.should have_all_columns(:id, :title)
          Blog.table.should have_all_columns(:blogs__id, :blogs__title)
          Blog.table.should_not have_all_columns(:id, :title, :garbage)
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