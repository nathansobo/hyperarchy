Sequel.migration do
  up do
    alter_table :users do
      add_column :password_reset_token, String
      add_column :password_reset_token_generated_at, Time
    end
  end

  down do
    alter_table :users do
      drop_column :password_reset_token
      drop_column :password_reset_token_generated_at
    end
  end
end
