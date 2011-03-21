Sequel.migration do
  up do
    add_column :elections, :creator_id, Integer
    add_column :candidates, :creator_id, Integer
  end
end
