Sequel.migration do
  up do
    add_column(:elections, :vote_count, Integer, :default => 0)
  end
end
