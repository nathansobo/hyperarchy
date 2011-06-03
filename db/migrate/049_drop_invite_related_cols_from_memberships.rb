Sequel.migration do
  up do
    alter_table(:memberships) do
      drop_column :pending
      drop_column :invitation_id
    end
  end

  down do
    alter_table(:memberships) do
      add_column :pending, TrueClass, :default => true
      add_column :invitation_id, Integer
    end
  end
end

