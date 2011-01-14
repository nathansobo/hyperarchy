Sequel.migration do
  up do
    create_table(:candidate_comments) do
      primary_key :id
      String  :body, :size=>255
      Integer :candidate_id
      Integer :creator_id
      Time    :created_at
      Time    :updated_at
    end
  end
  
  down do
    drop_table(:candidate_comments)
  end
end
