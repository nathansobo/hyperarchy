require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Monarch
  module Model
    module Relations
      describe View do
        attr_reader :relation, :view

        before do
          @relation = BlogPost.where(:blog_id => 1)
          @view = relation.view(:blog_1_posts)
        end

        describe "#column(column_or_name)" do
          context "if the underlying relation has a column corresponding to the given column or name" do
            it "returns a concrete column on itself with the same name and type as the underlying column" do
              view_column = view.column(:created_at)
              real_column = relation.column(:created_at)

              view_column.name.should == real_column.name
              view_column.type.should == real_column.type
              view_column.table.should == view
            end
          end

          context "if the underlying relation does not have a column corresponding to the given column or name" do
            it "returns nil" do
              view.column(:garbage).should be_nil
            end
          end
        end

        describe "#create_view(mode='')" do
          it "executes DDL on the database to create the view (as temporary if desired)" do
            mock(Origin).execute_ddl(
              "create temporary view blog_1_posts as (select blog_posts.* from blog_posts where blog_posts.blog_id = :v1)",
              :v1 => 1
            )
            view.create_view(:temporary)
          end
        end

        describe "#drop_view" do
          it "executes DDL on the database to drop the view" do
            mock(Origin).execute_ddl("drop view if exists blog_1_posts cascade")
            view.drop_view
          end
        end

        describe "#==(other)" do
          it "performs a structural comparison with other views" do
            view.should == relation.view(:blog_1_posts)
          end
        end
      end
    end
  end
end

