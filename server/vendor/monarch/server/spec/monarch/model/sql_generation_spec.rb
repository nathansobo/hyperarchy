require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Monarch
  module Model
    describe "SQL generation" do
      specify "tables" do
        User.table.to_sql.should be_like(%{
          select users.* from users
        })

        User.table.to_update_sql(:full_name => "John Travolta", :age => 47).should be_like(%{
          update users set users.age = 47, users.full_name = 'John Travolta'
        })

        stub(Origin).database_type { :postgres }
        User.table.to_update_sql(:full_name => "John Travolta", :age => 47).should be_like(%{
          update users set age = 47, full_name = 'John Travolta'
        })
      end

      specify "combined selections and projections" do
        User.where(:full_name => "Amory Lovins", :age => 40).to_sql.should be_like(%{
          select users.* from users where users.age = 40 and users.full_name = 'Amory Lovins'
        })
        User.where(:age => nil).to_sql.should be_like(%{
          select users.* from users where users.age is null
        })
        User.where(User[:age].neq(nil)).to_sql.should be_like(%{
          select users.* from users where users.age is not null
        })
        User.where(:age => 40).project(:id, :full_name).to_sql.should be_like(%{
          select users.id as id, users.full_name as full_name from users where users.age = 40
        })
        User.project(:id, :full_name).where(:full_name => "Nathan Sobo").to_sql.should be_like(%{
          select users.id as id, users.full_name as full_name from users where users.full_name = 'Nathan Sobo'
        })
        User.project(:id, :full_name).where(:full_name => "Nathan Sobo").project(:id).to_sql.should be_like(%{
          select users.id as id from users where users.full_name = 'Nathan Sobo'
        })

        User.where(:full_name => "Amory Lovins", :age => 40).to_update_sql(:full_name => "Amorous Loving", :age => 30).should be_like(%{
          update users set users.age = 30, users.full_name = 'Amorous Loving' where users.age = 40 and users.full_name = 'Amory Lovins'
        })
        User.where(:age => 40).project(:id, :full_name).to_update_sql(:full_name => "Lucile Ball").should be_like(%{
          update users set users.full_name = 'Lucile Ball' where users.age = 40
        })
        User.project(:id, :full_name).where(:full_name => "Nathan Sobo").to_update_sql({:full_name => "Nath Sobo"}).should be_like(%{
          update users set users.full_name = 'Nath Sobo' where users.full_name = 'Nathan Sobo'
        })
      end

      specify "combined inner joins, selections, and projections" do
        User.join_to(Blog).to_sql.should be_like(%{
          select
            users.id as users__id,
            users.full_name as users__full_name,
            users.age as users__age,
            users.signed_up_at as users__signed_up_at,
            users.has_hair as users__has_hair,
            blogs.id as blogs__id,
            blogs.title as blogs__title,
            blogs.user_id as blogs__user_id
          from users, blogs
          where users.id = blogs.user_id
        })
        User.join_to(Blog.where(:title => "Fun")).to_sql.should be_like(%{
          select
            users.id as users__id,
            users.full_name as users__full_name,
            users.age as users__age,
            users.signed_up_at as users__signed_up_at,
            users.has_hair as users__has_hair,
            blogs.id as blogs__id,
            blogs.title as blogs__title,
            blogs.user_id as blogs__user_id
          from users, blogs
          where blogs.title = 'Fun' and users.id = blogs.user_id
        })
        User.join_through(Blog).to_sql.should be_like(%{
          select blogs.* from users, blogs where users.id = blogs.user_id
        })
        User.where(:age => 21).join_through(Blog.where(:title => "I Can Drink Now")).to_sql.should be_like(%{
          select blogs.*
          from users, blogs
          where blogs.title = 'I Can Drink Now' and users.age = 21 and users.id = blogs.user_id
        })
        User.where(:age => 21).
          join_through(Blog.where(:title => "I Can Drink Now")).
          join_through(BlogPost.where(:title => "Day 5: The World Is Spining")).to_sql.should be_like(%{
            select
              blog_posts.*
            from
              users, blogs, blog_posts
            where
              blog_posts.title = 'Day 5: The World Is Spining'
              and blogs.id = blog_posts.blog_id
              and blogs.title = 'I Can Drink Now'
              and users.age = 21
              and users.id = blogs.user_id
          })

        User.where(:age => 21).join_through(Blog.where(:title => "I Can Drink Now")).to_update_sql(:title => "I'm 21").should be_like(%{
          update users, blogs
          set blogs.title = 'I\\'m 21'
          where blogs.title = 'I Can Drink Now' and users.age = 21 and users.id = blogs.user_id
        })

        User.where(:age => 21).join_through(Blog).where(:title => "I Can Drink Now").to_update_sql(:title => "I Am 21").should be_like(%{
          update users, blogs
          set blogs.title = 'I Am 21'
          where blogs.title = 'I Can Drink Now' and users.age = 21 and users.id = blogs.user_id
        })

        stub(Origin).database_type { :postgres }

        User.where(:age => 21).join_through(Blog.where(:title => "I Can Drink Now")).to_update_sql(:title => "I'm 21").should be_like(%{
          update users
          set title = 'I\\'m 21'
          from blogs
          where blogs.title = 'I Can Drink Now' and users.age = 21 and users.id = blogs.user_id
        })
      end

      specify "left joins" do
        Blog.left_join_to(BlogPost).to_sql.should be_like(%{
          select
            blogs.id as blogs__id,
            blogs.title as blogs__title,
            blogs.user_id as blogs__user_id,
            blog_posts.id as blog_posts__id,
            blog_posts.title as blog_posts__title,
            blog_posts.body as blog_posts__body,
            blog_posts.blog_id as blog_posts__blog_id,
            blog_posts.created_at as blog_posts__created_at,
            blog_posts.updated_at as blog_posts__updated_at,
            blog_posts.featured as blog_posts__featured
          from
            blogs left outer join blog_posts on blogs.id = blog_posts.blog_id
        })

        Blog.
          left_join_to(BlogPost.where(:title => "First Post!")).
          where(BlogPost[:id].eq(nil)).
          project(Blog).to_sql.should be_like(%{
            select
              blogs.*
            from
              blogs
              left outer join blog_posts
                on blogs.id = blog_posts.blog_id
                and blog_posts.title = 'First Post!'
            where
              blog_posts.id is null
          })

        Blog.
          left_join_to(BlogPost.where(:title => "First Post!")).
          where(BlogPost[:id].eq(nil)).
          project(Blog).to_update_sql(:title => "Zeroth Post!").should be_like(%{
            update
              blogs
              left outer join blog_posts
                on blogs.id = blog_posts.blog_id
                and blog_posts.title = 'First Post!'
            set
              blogs.title = 'Zeroth Post!'
            where
              blog_posts.id is null
          })

        stub(Origin).database_type { :postgres }

        # can only update one table in postgres, so left outer joins cannot be updated
        lambda do
          Blog.
            left_join_to(BlogPost.where(:title => "First Post!")).
            where(BlogPost[:id].eq(nil)).
            project(Blog).to_update_sql(:title => "Zeroth Post!")
        end.should raise_error
      end

      specify "orderings" do
        User.where(:age => 34).order_by(User[:full_name].desc).to_sql.should be_like(%{
          select users.* from users where users.age = 34 order by users.full_name desc
        })
      end

      def new_state
        Model::SqlGenerationState.new
      end

      specify "projections involving aggregation functions composed on top of other constructs" do
        User.project(User[:id].count).to_sql.should be_like(%{select count(users.id) as count from users})
        User.where(:age => 34).project(User[:id].count).to_sql.should be_like(%{
          select count(users.id) as count from users where users.age = 34
        })
        User.where(:age => 34).project(User[:id].count.as(:count2)).to_sql.should be_like(%{
          select count(users.id) as count2 from users where users.age = 34
        })
        User.where(:id => 1).join_through(Blog).project(Blog[:id].count, :id).to_sql.should be_like(%{
          select count(blogs.id) as count, blogs.id as id
          from users, blogs
          where users.id = 1 and users.id = blogs.user_id
        })
      end

      specify "groupings plus aggregations" do
        User.group_by(:age).project(:age, User[:id].count.as("count")).to_sql.should be_like(%{
          select users.age as age, count(users.id) as count from users group by users.age
        })
      end

      specify "selections involving subqueries" do
        Blog.group_by(:user_id).order_by(:title).project(Blog[:title].count.as(:count)).where(:count => 3).to_sql.should be_like(%{
          select t1.count as count
          from (
            select count(blogs.title) as count
            from blogs
            group by blogs.user_id
            order by blogs.title asc
          ) as t1
          where t1.count = 3
        })

        blog_post_counts =
          Blog.where(:user_id => "jan").left_join_to(BlogPost).
            group_by(Blog[:id]).
            project(Blog[:id].as(:blog_id), BlogPost[:id].count.as(:num_posts))
        blog_post_counts.where(:num_posts => 5).to_sql.should be_like(%{
          select t1.blog_id as blog_id, t1.num_posts as num_posts
          from (
            select blogs.id as blog_id, count(blog_posts.id) as num_posts
            from blogs left outer join blog_posts on blogs.id = blog_posts.blog_id
            where blogs.user_id = #{"jan".to_key}
            group by blogs.id
          ) as t1
          where t1.num_posts = 5
        })
      end

      specify "joins involving subqueries" do
        blog_post_counts =
          Blog.where(:user_id => "jan").left_join_to(BlogPost).
            group_by(Blog[:id]).
            project(Blog[:id].as(:blog_id), BlogPost[:id].count.as(:num_posts))

        Blog.join_to(blog_post_counts).project(:title, :num_posts).to_sql.should be_like(%{
          select blogs.title as title, t1.num_posts as num_posts
          from blogs, (
            select blogs.id as blog_id, count(blog_posts.id) as num_posts
            from blogs left outer join blog_posts on blogs.id = blog_posts.blog_id
            where blogs.user_id = #{"jan".to_key} group by blogs.id
          ) as t1
          where blogs.id = t1.blog_id
        })
      end

      specify "simple offsets" do
        Blog.where(:user_id => 1).offset(10).to_sql.should be_like(%{
          select blogs.*
          from blogs
          where blogs.user_id = 1
          offset 10  
        })
      end
    end
  end
end