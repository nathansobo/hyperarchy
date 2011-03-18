require 'spec_helper'

module Prequel
  module Sql
    describe InnerJoinedTableRef do
      before do
        class Blog < Prequel::Record
          column :id, :integer
          column :user_id, :integer
          column :title, :string
        end

        class Post < Prequel::Record
          column :id, :integer
          column :blog_id, :integer
          column :title, :string
        end

        class Comment < Prequel::Record
          column :id, :integer
          column :post_id, :integer
          column :body, :string
        end
      end

      describe "#flattened_table_refs" do
        attr_reader :query, :joined_table_ref

        describe "for a simple join of two table refs" do
          before do
            relation = Blog.join(Post)
            @query = relation.query
            @joined_table_ref = query.table_ref
          end

          it "returns a list of the 2 joined table refs and a singleton list of the join predicate" do
            table_refs, predicates = joined_table_ref.flatten_table_refs
            table_refs.should == [joined_table_ref.left, joined_table_ref.right]
            predicates.should == [joined_table_ref.predicate]
          end
        end

        context "for a left-associative 3-table joined table ref" do
          before do
            relation = Blog.join(Post).join(Comment)
            @query = relation.query
            @joined_table_ref = query.table_ref
          end

          it "returns a list of the 3 joined table refs and a list of all the join predicates" do
            table_refs, predicates = joined_table_ref.flatten_table_refs
            table_refs.should == [joined_table_ref.left.left, joined_table_ref.left.right, joined_table_ref.right]
            predicates.should == [joined_table_ref.left.predicate, joined_table_ref.predicate]
          end
        end

        context "for an inner joined table ref containing a subquery" do
          before do
            relation = Blog.where(:user_id => 1).join(Post)
            @query = relation.query
            @joined_table_ref = query.table_ref
          end

          it "includes the subquery in the flattened table refs" do
            table_refs, predicates = joined_table_ref.flatten_table_refs
            table_refs.should == [joined_table_ref.left, joined_table_ref.right]
            predicates.should == [joined_table_ref.predicate]
          end
        end

        context "for an inner joined table ref containing a left outer join" do
          before do
            relation = Blog.left_join(Post).join(Comment)
            @query = relation.query
            @joined_table_ref = query.table_ref
          end

          it "does not flatten the left joined table ref" do
            table_refs, predicates = joined_table_ref.flatten_table_refs

            table_refs.should == [joined_table_ref.left, joined_table_ref.right]
            predicates.should == [joined_table_ref.predicate]
          end
        end
      end
    end
  end
end
