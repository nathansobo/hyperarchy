class User < Model::Record
  column :full_name, :string
  column :age, :integer
  column :signed_up_at, :datetime

  relates_to_many :blogs do
    Blog.where(Blog[:user_id].eq(id))
  end

  relates_to_many :blog_posts do
    blogs.join(BlogPost).on(BlogPost[:blog_id].eq(Blog[:id])).project(BlogPost)
  end

  def great_name=(full_name)
    self.full_name = full_name + " The Great"
  end
end
