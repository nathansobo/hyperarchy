Sequel.migration do
  up do
    rename_column :users, :facebook_uid, :facebook_id
  end
  
  down do
    rename_column :users, :facebook_id, :facebook_uid
  end
end
