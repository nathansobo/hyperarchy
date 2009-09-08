class User < Model::Record
  column :full_name, :string
  column :email_address, :string

  relates_to_many :blogs do
    Blog.table
  end

  relates_to_many :blog_posts do
    BlogPost.table
  end
end
