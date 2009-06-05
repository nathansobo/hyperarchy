class Session < Model::Tuple
  attribute :user_id, :string

  belongs_to :user
end