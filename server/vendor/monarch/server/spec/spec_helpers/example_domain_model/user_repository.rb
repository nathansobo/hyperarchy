class UserRepository < Model::ExposedRepository
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

  def initialize(user)
    @user = user
  end
end
