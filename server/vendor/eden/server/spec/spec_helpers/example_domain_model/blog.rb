class Blog < Model::Tuple
  column :title, :string
  
  has_many :blog_posts
end
