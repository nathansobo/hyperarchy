class BlogPost < Model::Record
  column :title, :string
  column :body, :string
  column :blog_id, :string
  column :created_at, :datetime 

  belongs_to :blog
end
