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
            mock(Origin).execute_ddl("drop view blog_1_posts")
            view.drop_view
          end
        end
      end
    end
  end
end

