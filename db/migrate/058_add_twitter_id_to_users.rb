Sequel.migration do
  up do
    add_column :users, :twitter_id, Integer, :unique => true
  end
  
  down do
    drop_column :users, :twitter_id
  end
end
