Sequel.migration do
  up do
    add_column(:memberships, :notify_of_new_elections, TrueClass, :default => true)
    add_column(:memberships, :notify_of_new_candidates, TrueClass, :default => true)
  end
end
