Sequel.migration do
  up do
    alter_table :organizations do
      set_column_default :privacy, 'private'
    end
  end 
end

