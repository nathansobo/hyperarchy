Sequel.migration do
  up do
    add_column :users, :facebook_uid, String
  end
  
  down do
    drop_column :users, :facebook_uid
  end
end
