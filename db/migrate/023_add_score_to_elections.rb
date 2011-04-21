Sequel.migration do
  up do
    add_column :elections, :score, Float
  end
end
