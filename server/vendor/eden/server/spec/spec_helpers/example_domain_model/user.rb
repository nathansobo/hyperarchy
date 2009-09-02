class User < Model::Tuple
  column :full_name, :string
  column :email_address, :string

  relates_to_many :blogs do
    Blog.set
  end

  relates_to_many :blog_posts do
    BlogPost.set
  end
end
