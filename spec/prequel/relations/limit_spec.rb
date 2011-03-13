require 'spec_helper'

module Prequel
  module Relations
    describe Limit do
      before do
        class Blog < Prequel::Record
          column :id, :integer
        end
      end

      describe "#all" do
        before do
          Blog.create_table

          DB[:blogs] << { :id => 1 }
          DB[:blogs] << { :id => 2 }
          DB[:blogs] << { :id => 3 }
        end

        it "returns the results with the correct limit" do
          results = Blog.limit(2).all
          results.should == [Blog.find(1), Blog.find(2)]
        end
      end

      describe "#==" do
        it "defines equality semantically" do
          Blog.limit(2).should == Blog.limit(2)
          Blog.limit(2).should_not == Blog.limit(3)
          class Blog2 < Prequel::Record; end;
          Blog.limit(2).should_not == Blog2.limit(3)
        end
      end
      describe "#to_sql" do
        describe "with an explicitly ascending column" do
          it "generates the appropriate sql with a limit clause" do
            Blog.limit(2).to_sql.should be_like_query(%{
              select *
              from   blogs
              limit 2
            })
          end
        end

        describe "with a limit on top of a limit" do
          it "honors the count associated with the uppermost limit in the relational op tree" do
            Blog.limit(2).limit(10).to_sql.should be_like_query(%{
              select *
              from   blogs
              limit 10
            })
          end
        end
      end
    end
  end
end
