require 'spec_helper'

module Prequel
  module Relations
    describe OrderBy do
      before do
        class Blog < Prequel::Record
          column :id, :integer
          column :user_id, :integer
          column :title, :string
        end
      end

      describe "#all" do
        before do
          Blog.create_table

          DB[:blogs] << { :id => 1, :user_id => 3 }
          DB[:blogs] << { :id => 2, :user_id => 2 }
          DB[:blogs] << { :id => 3, :user_id => 1 }
        end

        it "returns the results in the correct order" do
          results = Blog.order_by(:user_id.asc).all
          results.should == [Blog.find(3), Blog.find(2), Blog.find(1)]
        end
      end

      describe "#to_sql" do
        it "generates the appropriate sql with a group by clause" do
          Blog.order_by(:user_id.asc).to_sql.should be_like_query(%{
            select *
            from   blogs
            order  by blogs.user_id asc
          })
        end
      end
    end
  end
end