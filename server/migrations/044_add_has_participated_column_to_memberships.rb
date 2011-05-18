Sequel.migration do
  up do
    add_column :memberships, :has_participated, TrueClass, :default => false
  end

  down do
    drop_column :memberships, :has_participated
  end
end

