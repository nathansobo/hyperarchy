Sequel.migration do
  up do
    alter_table :elections do
      add_column :updated_at, Time
      add_column :created_at, Time
    end
  end

  down do
    alter_table :elections do
      drop_column :updated_at
      drop_column :created_at
    end
  end
end
