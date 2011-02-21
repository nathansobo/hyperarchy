class UserRepository < Monarch::Model::ExposedRepository
  attr_reader :user

  expose :users do
    User.table
  end

  expose :blogs do
    user.blogs
  end

  expose :blog_posts do
    user.blog_posts
  end

  expose :super_blog_posts do
    user.blog_posts.
      join(Blog).
        on(BlogPost[:blog_id].eq(Blog[:id])).
      project(BlogPost, Blog[:title].as(:blog_title), Blog[:user_id])
  end

  def initialize(user)
    @user = user
  end
end
