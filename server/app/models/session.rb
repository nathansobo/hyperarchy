class Session < Model::Record
  column :user_id, :key

  belongs_to :user
end
