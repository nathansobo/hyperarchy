class Session < Model::Tuple
  attribute :user_id, :string

  relates_to_one :user do
    User.where(User[:id].eq(user_id))
  end
end