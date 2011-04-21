Sequel.migration do
  up do
    create_table(:candidates) do
      primary_key :id
      String :body, :size=>255
      Integer :election_id
      Integer :position
    end
    
    create_table(:elections) do
      primary_key :id
      Integer :organization_id
      String :body, :size=>255
    end
    
    create_table(:invitations) do
      primary_key :id
      String :guid, :size=>255
      String :sent_to_address, :size=>255
      String :first_name, :size=>255
      String :last_name, :size=>255
      TrueClass :redeemed
      Integer :inviter_id
      Integer :invitee_id
    end
    
    create_table(:majorities) do
      primary_key :id
      Integer :election_id
      Integer :winner_id
      Integer :loser_id
      Integer :count
    end
    
    create_table(:memberships) do
      primary_key :id
      Integer :organization_id
      Integer :user_id
      Integer :invitation_id
      String :role, :size=>255
      TrueClass :pending
    end
    
    create_table(:organizations) do
      primary_key :id
      String :name, :size=>255
      String :description, :size=>255
    end
    
    create_table(:rankings) do
      primary_key :id
      Integer :user_id
      Integer :election_id
      Integer :candidate_id
      Float :position
    end
    
    create_table(:users) do
      primary_key :id
      String :first_name, :size=>255
      String :last_name, :size=>255
      String :email_address, :size=>255
      String :encrypted_password, :size=>255
    end
  end
  
  down do
    drop_table(:candidates, :elections, :invitations, :majorities, :memberships, :organizations, :rankings, :users)
  end
end
