Sequel.migration do
  up do
    add_column(:memberships, :last_visited, Time)
    self[:memberships].update(:last_visited => Time.now)
  end
end
