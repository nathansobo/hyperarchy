class BlogPost < Model::Record
  column :title, :string
  column :body, :string
  column :blog_id, :string

  belongs_to :blog
end
