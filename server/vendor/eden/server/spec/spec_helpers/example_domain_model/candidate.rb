class Candidate < Model::Tuple
  column :body, :string
  column :blog_id, :string

  belongs_to :blog
end
