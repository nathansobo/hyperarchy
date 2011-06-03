require 'spec_helper'

module Prequel
  module Relations
    describe Union do
      before do
        class ::Blog < Prequel::Record
          column :id, :integer
          column :user_id, :integer
          column :public, :boolean

          has_many :posts
        end

        class ::Post < Prequel::Record
          column :id, :integer
          column :blog_id, :integer
        end
      end

      describe "#all" do
        attr_reader :blog_1, :blog_2, :blog_3, :blog_1_post, :blog_2_post, :blog_3_post

        before do
          Blog.create_table
          Post.create_table

          @blog_1 = Blog.create(:user_id => 1)
          @blog_2 = Blog.create(:user_id => 1)
          @blog_3 = Blog.create(:user_id => 2, :public => true)
          blog_4 = Blog.create(:user_id => 2)

          @blog_1_post = blog_1.posts.create
          @blog_2_post = blog_2.posts.create
          @blog_3_post = blog_3.posts.create
          blog_4.posts.create
        end

        it "returns all the tuples in the union" do
          (Blog.where(:user_id => 1) | Blog.where(:public => true)).all.should =~ [blog_1, blog_2, blog_3]
        end

        it "can return the results of a join containing a union" do
          tuples = (Blog.where(:user_id => 1) | Blog.where(:public => true)).join(Post).all
          tuples.map {|t| t[:blogs]}.should =~ [blog_1, blog_2, blog_3]
          tuples.map {|t| t[:posts]}.should =~ [blog_1_post, blog_2_post, blog_3_post]
        end

        it "can return the results of the union of two table projections" do
          (Blog.join_through(Post) | Blog.join_through(Post)).first.should be_an_instance_of(Post)
        end
      end

      describe "#to_sql" do
        context "for a union of 2 tables" do
          it "returns the appropriate SQL" do
            (Blog.where(:user_id => 1) | Blog.where(:public => true)).to_sql.should be_like_query(%{
              (select blogs.id,
                      blogs.user_id,
                      blogs.public
               from   blogs
               where  blogs.user_id = :v1)
              union
              (select blogs.id,
                      blogs.user_id,
                      blogs.public
               from   blogs
               where  blogs.public = :v2)
            }, :v1 => 1, :v2 => true)
          end
        end

        context "for a union of 3 tables" do
          it "returns the appropriate SQL" do
            (Blog.where(:user_id => 1) | Blog.where(:user_id => 2) | Blog.where(:public => true)).to_sql.should be_like_query(%{
              ((select blogs.id,
                       blogs.user_id,
                       blogs.public
                from   blogs
                where  blogs.user_id = :v1)
               union
               (select blogs.id,
                       blogs.user_id,
                       blogs.public
                from   blogs
                where  blogs.user_id = :v2))
              union
              (select blogs.id,
                      blogs.user_id,
                      blogs.public
               from   blogs
               where  blogs.public = :v3)
            }, :v1 => 1, :v2 => 2, :v3 => true)
          end
        end

        describe "when the union is inside of a join" do
          it "returns the appropriate SQL" do
            (Blog.where(:user_id => 1) | Blog.where(:public => true)).join(Post).to_sql.should be_like_query(%{
              select t1.id         as t1__id,
                     t1.user_id    as t1__user_id,
                     t1.public     as t1__public,
                     posts.id      as posts__id,
                     posts.blog_id as posts__blog_id
              from   ((select blogs.id,
                              blogs.user_id,
                              blogs.public
                       from   blogs
                       where  blogs.user_id = :v1)
                      union
                      (select blogs.id,
                              blogs.user_id,
                              blogs.public
                       from   blogs
                       where  blogs.public = :v2)) as t1
                     inner join posts
                       on t1.id = posts.blog_id
            }, :v1 => 1, :v2 => true)
          end
        end

        describe "when the union is inside a join-project" do
          it "returns the appropriate SQL" do
            (Blog.where(:user_id => 1) | Blog.where(:public => true)).join_through(Post).to_sql.should be_like_query(%{
              select posts.id,
                     posts.blog_id
              from   ((select blogs.id,
                              blogs.user_id,
                              blogs.public
                       from   blogs
                       where  blogs.user_id = :v1)
                      union
                      (select blogs.id,
                              blogs.user_id,
                              blogs.public
                       from   blogs
                       where  blogs.public = :v2)) as t1
                     inner join posts
                       on t1.id = posts.blog_id
            }, :v1 => 1, :v2 => true)
          end
        end

        describe "when a selection is directly above a union" do
          it "returns the appropriate SQL" do
            (Blog.where(:user_id => 1) | Blog.where(:public => true)).where(:id => 1).to_sql.should be_like_query(%{
              select t1.id,
                     t1.user_id,
                     t1.public
              from   ((select blogs.id,
                              blogs.user_id,
                              blogs.public
                       from   blogs
                       where  blogs.user_id = :v1)
                      union
                      (select blogs.id,
                              blogs.user_id,
                              blogs.public
                       from   blogs
                       where  blogs.public = :v2)) as t1
              where  t1.id = :v3
            }, :v1=>1, :v2=>true, :v3=>1)
          end
        end
      end
    end
  end
end