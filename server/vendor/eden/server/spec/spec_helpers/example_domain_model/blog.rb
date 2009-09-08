class Blog < Model::Record
  column :title, :string
  column :user_id, :string

  has_many :blog_posts
  belongs_to :user
end
