require 'spec_helper'

module Prequel
  module Relations
    describe Projection do
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

      describe "#initialize" do
        context "when given the name of a table in the projection's operand" do
          it "derives every column in that table on the projection, aliased to its unqualified name" do
            operand = Blog.where(:user_id => 1).join(Post, Blog[:id] => :blog_id).join(Comment, Post[:id] => :post_id)
            comments_projection = operand.project(:comments)

            derived_columns = comments_projection.columns
            derived_columns.size.should == Comment.columns.size
            derived_columns.each do |derived_column|
              origin = derived_column.origin
              origin.table.should == Comment.table
              derived_column.alias_name.should == origin.name
            end
          end
        end
      end

      describe "#get_column" do
        it "returns a derived column on the projection by name or qualified name" do
          projection = Blog.join(Post, Blog[:id] => :blog_id).project(Post)

          derived_column = projection.get_column(:id)
          derived_column.origin.should == Post.get_column(:id)
          projection.get_column(Post[:id]).should == derived_column
        end
      end

      describe "#all" do
        before do
          Blog.create_table
          Post.create_table
          Comment.create_table
        end

        context "when projecting a table" do
          it "returns instances of that table's tuple class" do
            DB[:blogs] << { :id => 1, :user_id => 1, :title => "Blog 1"}
            DB[:blogs] << { :id => 2, :user_id => 2, :title => "Blog 2"}
            DB[:posts] << { :id => 1, :blog_id => 1, :title => "Blog 1, Post 1"}
            DB[:posts] << { :id => 2, :blog_id => 1, :title => "Blog 1, Post 2"}
            DB[:posts] << { :id => 3, :blog_id => 2, :title => "Blog 2, Post 1"}

            projection = Blog.where(:user_id => 1).join(Post, Blog[:id] => :blog_id).project(Post)

            results = projection.all
            results.size.should == 2
            results[0].should == Post.find(1)
            results[1].should == Post.find(2)
          end
        end

        context "when projecting individual columns" do
          it "returns instances of the projection's custom tuple class, with accessors for the particular fields" do
            DB[:blogs] << { :id => 1, :user_id => 1, :title => "Blog 1"}
            DB[:posts] << { :id => 1, :blog_id => 1, :title => "Blog 1, Post 1"}

            projection = Blog.join(Post, Blog[:id] => :blog_id).project(Blog[:title].as(:blog_title), Post[:title].as(:post_title))

            results = projection.all
            results.size.should == 1
            results.first.should be_an_instance_of(projection.tuple_class)
            results.first.blog_title.should == "Blog 1"
            results.first.post_title.should == "Blog 1, Post 1"
          end
        end

        context "when projecting a count" do
          it "returns a single result" do
            DB[:blogs] << { :id => 1, :user_id => 1, :title => "Blog 1"}
            DB[:blogs] << { :id => 2, :user_id => 1, :title => "Blog 2"}
            DB[:blogs] << { :id => 3, :user_id => 3, :title => "Blog 3"}

            Blog.where(:user_id => 1).project(:id.count).all.first.count.should == 2
          end
        end

        context "when the projection is embedded in a join" do
          it "constructs the appropriate composite tuples" do
            DB[:blogs] << { :id => 1, :user_id => 1, :title => "Blog 1"}
            DB[:posts] << { :id => 1, :blog_id => 1, :title => "Blog 1, Post 1"}
            DB[:comments] << { :id => 1, :post_id => 1, :body => "Blog 1, Post 1, Comment 1"}

            comments_projection = Comment.project(:post_id.as(:post_id_of_comment), :body.as(:comment_body))
            rel = Blog.join(Post.join(comments_projection, Post[:id] => :post_id_of_comment), Blog[:id] => :blog_id)

            results = rel.all

            results.size.should == 1
            results.first[:blogs].should == Blog.find(1)
            results.first[:posts].should == Post.find(1)
            results.first[:post_id_of_comment].should == Comment.find(1).post_id
            results.first[:comment_body].should == Comment.find(1).body
          end
        end
      end

      describe "#update(attributes)" do
        before do
          Blog.create_table
          Post.create_table
          Comment.create_table

          DB[:blogs] << { :id => 1 }
          DB[:blogs] << { :id => 2 }
          DB[:posts] << { :id => 1, :blog_id => 1 }
          DB[:posts] << { :id => 2, :blog_id => 1 }
          DB[:posts] << { :id => 3, :blog_id => 2 }
          DB[:comments] << { :id => 1, :post_id => 1 }
          DB[:comments] << { :id => 2, :post_id => 2 }
          DB[:comments] << { :id => 3, :post_id => 3 }
        end

        it "performs an update with the projected table as the target" do
          Blog.where(:id => 1).join(Post).join_through(Comment).update(:body => "New Body").should == 2
          Comment.find(1).body.should == "New Body"
          Comment.find(2).body.should == "New Body"
          Comment.find(3).body.should be_nil
        end
      end

      describe "#==" do
        it "compares projections semantically" do
          Comment.project(:post_id.as(:comment_post_id), :body.as(:comment_body)).should ==
            Comment.project(:post_id.as(:comment_post_id), :body.as(:comment_body))
        end
      end
      
      describe "#to_sql" do
        describe "a projection of particular columns, some with aliases" do
          it "generates the appropriate sql" do
            Blog.project(:user_id, :title.as(:name)).to_sql.should be_like_query(%{
              select blogs.user_id, blogs.title as name from blogs
            })
          end
        end

        describe "a projection of a set function" do
          it "generates the appropriate sql" do
            Blog.project(:id.count.as(:blog_count)).to_sql.should be_like_query(%{
              select count(blogs.id) as blog_count from blogs
            })
          end
        end

        describe "a projection of all columns in a table on top of a simple inner join" do
          it "generates the appropriate sql" do
            Blog.join(Post, Blog[:id] => :blog_id).project(:posts).to_sql.should be_like_query(%{
              select posts.id,
                     posts.blog_id,
                     posts.title
              from   blogs
                     inner join posts
                       on blogs.id = posts.blog_id
            })
          end
        end

        describe "a projection of all columns in a table on top of a right-associative 3-table join, projecting columns from the subquery" do
          it "generates the appropriate sql, aliasing columns from subqueries back to their natural names" do
            Blog.join(Post.join(Comment, Post[:id] => :post_id), Blog[:id] => :blog_id).project(:comments).to_sql.should be_like_query(%{
              select t1.comments__id      as id,
                     t1.comments__post_id as post_id,
                     t1.comments__body    as body
              from   blogs
                     inner join (select posts.id         as posts__id,
                                        posts.blog_id    as posts__blog_id,
                                        posts.title      as posts__title,
                                        comments.id      as comments__id,
                                        comments.post_id as comments__post_id,
                                        comments.body    as comments__body
                                 from   posts
                                        inner join comments
                                          on posts.id = comments.post_id) as t1
                       on blogs.id = t1.posts__blog_id
            })
          end
        end

        describe "a projection embedded inside of a join" do
          it "generates the appropriate sql" do
            comments_projection = Comment.project(:post_id.as(:post_id_of_comment), :body.as(:comment_body))
            rel = Blog.join(Post.join(comments_projection, Post[:id] => :post_id_of_comment), Blog[:id] => :blog_id)
            rel.to_sql.should be_like_query(%{
              select blogs.id                  as blogs__id,
                     blogs.user_id             as blogs__user_id,
                     blogs.title               as blogs__title,
                     t1.posts__id              as t1__posts__id,
                     t1.posts__blog_id         as t1__posts__blog_id,
                     t1.posts__title           as t1__posts__title,
                     t1.t2__post_id_of_comment as t1__t2__post_id_of_comment,
                     t1.t2__comment_body       as t1__t2__comment_body
              from   blogs
                     inner join (select posts.id              as posts__id,
                                        posts.blog_id         as posts__blog_id,
                                        posts.title           as posts__title,
                                        t2.post_id_of_comment as t2__post_id_of_comment,
                                        t2.comment_body       as t2__comment_body
                                 from   posts
                                        inner join (select comments.post_id as
                                                           post_id_of_comment,
                                                           comments.body    as comment_body
                                                    from   comments) as t2
                                          on posts.id = t2.post_id_of_comment) as t1
                       on blogs.id = t1.posts__blog_id
            })
          end
        end
      end

      describe "#to_update_sql(attributes)" do
        describe "for a table projection above 2-table inner join" do
          it "generates the appropriate update SQL, with the non-target table in the from clause and the join condition in the where clause" do
            Blog.join_through(Post).to_update_sql(:body => "New Body").should be_like_query(%{
              update posts set body = :v1 from blogs where blogs.id = posts.blog_id
            }, :v1 => "New Body")
          end
        end

        describe "for a table projection above 3-table inner join" do
          it "generates the appropriate update SQL, with the flattened non-target tables in the from clause and the join conditions in the where clause" do
            Blog.join(Post).join(Comment).project(Post).to_update_sql(:body => "New Body").should be_like_query(%{
              update posts set body = :v1
              from blogs, comments
              where blogs.id = posts.blog_id and posts.id = comments.post_id
            }, :v1 => "New Body")
          end
        end

        describe "for an update based on an aliased column" do
          it "generates the appropriate sql, using the alias name to reference the column" do
            Post.column(:comment_count, :integer)
            Post.join(Comment.group_by(:post_id).project(:post_id, :id.count.as(:num_comments))).to_update_sql(:comment_count => :num_comments).should be_like_query(%{
              update posts
              set    comment_count = t1.num_comments
              from   (select comments.post_id,
                             count(comments.id) as num_comments
                      from   comments
                      group  by comments.post_id) as t1
              where  posts.id = t1.post_id
            })
          end
        end

      end

      describe "#wire_representation" do
        it "returns a JSON representation that can be evaluated in a sandbox" do
          projection = Blog.join_through(Post)

          projection.wire_representation.should == {
            :type => "table_projection",
            :operand => projection.operand.wire_representation,
            :projected_table => "posts"
          }
        end
      end
    end
  end
end
