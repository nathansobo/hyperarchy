Sequel.migration do
  up do
    create_table :election_visits do
      primary_key :id
      Integer :election_id
      Integer :user_id
      Time :created_at
      Time :updated_at
    end
  end

  down do
    drop_table :election_visits
  end
end
