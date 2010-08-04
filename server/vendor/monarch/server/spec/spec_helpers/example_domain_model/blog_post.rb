class BlogPost < Monarch::Model::Record
  column :title, :string
  column :body, :string, :default => "Enter your post here..."
  column :blog_id, :key
  column :created_at, :datetime
  column :featured, :boolean

  belongs_to :blog
end
