require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Model
  describe "SQL generation" do
    specify "tables" do
      User.table.to_sql.should == %{select * from users}
    end

    specify "combined selections and projections" do
      User.where({:full_name => "Amory Lovins", :age => 40}).to_sql.should be_like(%{
        select * from users where users.age = 40 and users.full_name = "Amory Lovins"
      })
      User.where({:age => 40}).project(:id, :full_name).to_sql.should be_like(%{
        select users.id, users.full_name from users where users.age = 40
      })
      User.project(:id, :full_name).where({:full_name => "Nathan Sobo"}).to_sql.should be_like(%{
        select users.id, users.full_name from users where users.full_name = "Nathan Sobo"
      })
      User.project(:id, :full_name).where({:full_name => "Nathan Sobo"}).project(:id).to_sql.should be_like(%{
        select users.id from users where users.full_name = "Nathan Sobo"
      })
    end

    specify "combined inner joins, selections, and projections" do
      User.join_to(Blog).to_sql.should be_like(%{
        select * from users inner join blogs on users.id = blogs.user_id
      })
      User.join_through(Blog).to_sql.should be_like(%{
        select blogs.* from users inner join blogs on users.id = blogs.user_id
      })
      User.where(:age => 21).join_through(Blog.where(:title => "I Can Drink Now")).to_sql.should be_like(%{
        select
          blogs.*
        from
          users inner join blogs on users.id = blogs.user_id
        where
          users.age = 21 and blogs.title = "I Can Drink Now"
      })
      User.where(:age => 21).
        join_through(Blog.where(:title => "I Can Drink Now")).
        join_through(BlogPost.where(:title => "Day 5: The World Is Spining")).to_sql.should be_like(%{
        select
          blog_posts.*
        from
          users
          inner join blogs on users.id = blogs.user_id
          inner join blog_posts on blogs.id = blog_posts.blog_id
        where
          users.age = 21
          and blogs.title = "I Can Drink Now"
          and blog_posts.title = "Day 5: The World Is Spining"
      })
    end

  end
end