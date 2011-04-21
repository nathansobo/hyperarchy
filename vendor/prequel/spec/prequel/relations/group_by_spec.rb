require 'spec_helper'

module Prequel
  module Relations
    describe GroupBy do
      before do
        class Blog < Prequel::Record
          column :id, :integer
          column :user_id, :integer
          column :title, :string
        end

        class Post < Prequel::Record
          column :id, :integer
          column :blog_id, :integer
          column :category_id, :integer
          column :title, :string
        end
      end

      describe "#all" do
        before do
          Blog.create_table
          Post.create_table

          DB[:blogs] << { :id => 1, :user_id => 1 }
          DB[:blogs] << { :id => 2, :user_id => 2 }
          DB[:posts] << { :id => 1, :blog_id => 1 }
          DB[:posts] << { :id => 2, :blog_id => 1 }
          DB[:posts] << { :id => 3, :blog_id => 2 }
        end

        context "a projection on top of a group by" do
          it "returns the results, taking group by into account" do
            results = Blog.join(Post, Blog[:id] => :blog_id).
                group_by(:user_id).
                project(Blog[:user_id], Post[:id].count).all

            results[0].user_id.should == 1
            results[0].count.should == 2
            results[1].user_id.should == 2
            results[1].count.should == 1
          end
        end
      end

      describe "#==" do
        it "implements semantic equality" do
          Post.group_by(:blog_id).should == Post.group_by(:blog_id)
          Post.group_by(:blog_id).should_not == Blog.group_by(:user_id)
          Post.group_by(:blog_id).should_not == Post.group_by(:category_id)
        end
      end

      describe "#to_sql" do
        it "generates the appropriate sql with a group by clause" do
          Blog.join(Post, Blog[:id] => :blog_id).group_by(:user_id, :category_id).project(Post[:id].count).to_sql.should be_like_query(%{
            select count(posts.id)
            from   blogs
                   inner join posts
                     on blogs.id = posts.blog_id
            group  by blogs.user_id,
                      posts.category_id
          })
        end
      end
    end
  end
end
