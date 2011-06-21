Sequel.migration do
  up do
    alter_table(:elections) do
      add_column :details, String
    end
  end

  down do
    alter_table(:elections) do
      drop_column :details
    end
  end
end

