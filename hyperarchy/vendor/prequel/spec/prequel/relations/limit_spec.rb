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
              select blogs.id
              from   blogs
              limit 2
            })
          end
        end

        describe "with a limit on top of a limit" do
          it "honors the count associated with the uppermost limit in the relational op tree" do
            Blog.limit(2).limit(10).to_sql.should be_like_query(%{
              select blogs.id
              from   blogs
              limit 10
            })
          end
        end

        describe "when nested inside of a join" do
          before do
            class Post < Prequel::Record
              column :id, :integer
              column :blog_id, :integer
            end
          end

          it "generates a subquery with the limit" do
            Blog.join(Post.limit(5)).to_sql.should be_like_query(%{
              select blogs.id as blogs__id,
                     t1.id as t1__id,
                     t1.blog_id as t1__blog_id
              from   blogs
                     inner join (select posts.id,
                                        posts.blog_id
                                 from posts
                                 limit 5) as t1
                        on blogs.id = t1.blog_id
            })

            Blog.limit(5).join(Post).to_sql.should be_like_query(%{
              select t1.id as t1__id,
                     posts.id as posts__id,
                     posts.blog_id as posts__blog_id
              from   (select blogs.id
                      from blogs
                      limit 5) as t1
                     inner join posts
                        on t1.id = posts.blog_id
            })
          end
        end
      end
    end
  end
end
