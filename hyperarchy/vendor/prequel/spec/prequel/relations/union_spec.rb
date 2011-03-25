require 'spec_helper'

module Prequel
  module Relations
    describe Union do
      before do
        class ::Blog < Prequel::Record
          column :id, :integer
          column :user_id, :integer
          column :public, :boolean
        end
      end

      describe "#all" do
        attr_reader :blog_1, :blog_2, :blog_3

        before do
          Blog.create_table
          @blog_1 = Blog.create(:user_id => 1)
          @blog_2 = Blog.create(:user_id => 1)
          @blog_3 = Blog.create(:user_id => 2, :public => true)
          Blog.create(:user_id => 2)
        end

        it "returns all the tuples in the union" do
          (Blog.where(:user_id => 1) | Blog.where(:public => true)).all.should =~ [blog_1, blog_2, blog_3]
        end
      end

      describe "#to_sql" do
        context "for a union of 2 tables" do
          it "returns the appropriate SQL" do
            (Blog.where(:user_id => 1) | Blog.where(:public => true)).to_sql.should be_like_query(%{
              (select * from blogs where blogs.user_id = :v1) union (select * from blogs where blogs.public = :v2)
            }, :v1 => 1, :v2 => true)
          end
        end

        context "for a union of 3 tables" do
          it "returns the appropriate SQL" do
            (Blog.where(:user_id => 1) | Blog.where(:user_id => 2) | Blog.where(:public => true)).to_sql.should be_like_query(%{
              ((select * from blogs where blogs.user_id = :v1) union (select * from blogs where blogs.user_id = :v2)) union (select * from blogs where blogs.public = :v3)
            }, :v1 => 1, :v2 => 2, :v3 => true)
          end
        end

        describe "when the union is inside of a join" do
          before do
            class ::Post < Prequel::Record
              column :id, :integer
              column :blog_id, :integer
            end
          end

          it "returns the appropriate SQL" do
            pending
            puts (Blog.where(:user_id => 1) | Blog.where(:public => true)).join(Post).to_sql
          end
        end
      end
    end
  end
end