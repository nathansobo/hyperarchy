Sequel.migration do
  up do
    add_column(:organizations, :members_can_invite, TrueClass, :default => false)
  end
end
