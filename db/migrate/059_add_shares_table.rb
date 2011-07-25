Sequel.migration do
  up do
    create_table :shares do
      primary_key :id
      String :code, :null => false
      Integer :user_id, :null => false
      Integer :question_id, :null => false
      Time :created_at, :null => false
      String :service, :null => false
    end
  end
  
  down do
    drop_table :shares
  end
end
