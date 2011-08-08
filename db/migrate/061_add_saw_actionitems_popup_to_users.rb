Sequel.migration do
  up do
    add_column :users, :saw_actionitems_popup, TrueClass, :default => false
  end
  
  down do
    drop_column :users, :saw_actionitems_popup
  end
end
