class Session < Model::Record
  column :user_id, :string

  belongs_to :user
end
