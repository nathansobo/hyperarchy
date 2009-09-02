class Blog < Model::Tuple
  column :title, :string
  column :user_id, :string

  has_many :blog_posts
  belongs_to :user
end
