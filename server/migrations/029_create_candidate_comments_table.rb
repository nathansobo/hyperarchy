Sequel.migration do
  up do
    create_table :candidate_comments do
      column :body, String
      column :candidate_id, Integer
      column :creator_id, Integer
      column :created_at, Time
      column :updated_at, Time
    end
  end

  down do
    drop_table :candidate_comments
  end
end
