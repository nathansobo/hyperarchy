require 'spec_helper'

module Prequel
  module Relations
    describe Distinct do
      before do
        class Blog < Prequel::Record
          column :id, :integer
        end

        class Post < Prequel::Record
          column :id, :integer
          column :blog_id, :integer
        end
      end

      describe "#all" do
        before do
          Blog.create_table
          Post.create_table

          DB[:blogs] << { :id => 1 }
          DB[:blogs] << { :id => 2 }
          DB[:posts] << { :id => 1, :blog_id => 1 }
          DB[:posts] << { :id => 2, :blog_id => 1 }
          DB[:posts] << { :id => 3, :blog_id => 2 }
        end

        it "returns only distinct records" do
          Post.join_through(Blog).distinct.all.should =~ [Blog.find(1), Blog.find(2)]
        end
      end
    end
  end
end
