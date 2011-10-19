Sequel.migration do
  up do
    drop_column :users, :saw_actionitems_popup
  end

  down do
    add_column :users, :saw_actionitems_popup, TrueClass, :default => false
  end
end

