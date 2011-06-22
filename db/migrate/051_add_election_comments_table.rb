Sequel.migration do
  up do
    create_table :election_comments do
      primary_key :id
      String :body
      Integer :election_id
      Integer :creator_id
      Time :created_at
      Time :updated_at
    end
  end

  down do
    drop_table(:election_comments)
  end
end

