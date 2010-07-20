Sequel.migration do
  up do
    alter_table :elections do
      add_column :updated_at, :datetime
      add_column :created_at, :datetime
    end
  end

  down do
    alter_table :elections do
      drop_column :updated_at
      drop_column :created_at
    end
  end
end
