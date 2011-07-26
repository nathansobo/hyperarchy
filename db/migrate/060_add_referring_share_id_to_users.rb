Sequel.migration do
  up do
    add_column :users, :referring_share_id, Integer
  end
  
  down do
    drop_column :users, :referring_share_id
  end
end
