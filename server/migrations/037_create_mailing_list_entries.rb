Sequel.migration do
  up do
    create_table :mailing_list_entries do
      primary_key :id
      String :email_address
      String :comments
      Time :created_at
    end
  end
  
  down do
    drop_table :mailing_list_entries
  end
end

