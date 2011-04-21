require 'spec_helper'

module Prequel
  module Relations
    describe Offset do
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

        it "returns the results with the correct offset" do
          results = Blog.limit(2).offset(1).all
          results.should == [Blog.find(2), Blog.find(3)]
        end
      end

      describe "#==" do
        it "defines equality semantically" do
          Blog.offset(2).should == Blog.offset(2)
          Blog.offset(2).should_not == Blog.offset(3)
          class OtherRelation < Prequel::Record; end;
          Blog.offset(2).should_not == OtherRelation.offset(2)
        end
      end
      describe "#to_sql" do
        describe "with an explicitly ascending column" do
          it "generates the appropriate sql with a limit clause" do
            Blog.limit(3).offset(2).to_sql.should be_like_query(%{
              select blogs.id
              from   blogs
              limit 3
              offset 2
            })
          end
        end

        describe "with an offset on top of an offset" do
          it "honors the count associated with the uppermost offset in the relational op tree" do
            Blog.limit(3).offset(2).offset(10).to_sql.should be_like_query(%{
              select blogs.id
              from   blogs
              limit 3
              offset 10
            })
          end
        end
      end
    end
  end
end
