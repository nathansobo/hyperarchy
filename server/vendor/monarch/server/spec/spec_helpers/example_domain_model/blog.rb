class Blog < Model::Record
  column :title, :string
  column :user_id, :key

  has_many :blog_posts
  belongs_to :user
end
