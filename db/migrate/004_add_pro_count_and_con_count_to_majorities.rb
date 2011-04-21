Sequel.migration do
  up do
    rename_column :majorities, :count, :pro_count
    add_column :majorities, :con_count, Integer
  end
end
