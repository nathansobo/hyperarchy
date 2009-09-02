class Session < Model::Tuple
  column :user_id, :string

  belongs_to :user
end
