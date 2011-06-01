Sequel.migration do
  up do
    create_table(:candidate_comments) do
      primary_key :id
      String :body, :text=>true
      Integer :candidate_id
      Integer :creator_id
      DateTime :created_at
      DateTime :updated_at
    end
    
    create_table(:candidates) do
      primary_key :id
      String :body, :size=>255
      Integer :election_id
      Integer :position
      Integer :creator_id
      String :details, :default=>"", :text=>true
      DateTime :created_at
      DateTime :updated_at
    end
    
    create_table(:election_visits) do
      primary_key :id
      Integer :election_id
      Integer :user_id
      DateTime :created_at
      DateTime :updated_at
    end
    
    create_table(:elections) do
      primary_key :id
      Integer :organization_id
      String :body, :text=>true
      DateTime :updated_at
      DateTime :created_at
      Integer :creator_id
      Integer :vote_count, :default=>0
      Float :score
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
      DateTime :created_at
      DateTime :updated_at
    end
    
    create_table(:mailing_list_entries) do
      primary_key :id
      String :email_address, :text=>true
      String :comments, :text=>true
      DateTime :created_at
    end
    
    create_table(:majorities) do
      primary_key :id
      Integer :election_id
      Integer :winner_id
      Integer :loser_id
      Integer :pro_count
      Integer :con_count
      DateTime :winner_created_at
    end
    
    create_table(:memberships) do
      primary_key :id
      Integer :organization_id
      Integer :user_id
      Integer :invitation_id
      String :role, :size=>255
      TrueClass :pending
      DateTime :last_visited
      DateTime :created_at
      DateTime :updated_at
      String :notify_of_new_elections, :text=>true
      String :notify_of_new_candidates, :text=>true
      String :notify_of_new_comments_on_own_candidates, :text=>true
      String :notify_of_new_comments_on_ranked_candidates, :text=>true
      TrueClass :has_participated, :default=>false
    end
    
    create_table(:organizations) do
      primary_key :id
      String :name, :size=>255
      String :description, :size=>255
      TrueClass :dismissed_welcome_guide, :default=>false
      TrueClass :members_can_invite, :default=>false
      TrueClass :use_ssl, :default=>true
      DateTime :created_at
      DateTime :updated_at
      Integer :election_count, :default=>0
      TrueClass :social, :default=>false
      String :privacy, :default=>"private", :text=>true
      String :membership_code, :text=>true
      Integer :member_count, :default=>0
    end
    
    create_table(:rankings) do
      primary_key :id
      Integer :user_id
      Integer :election_id
      Integer :candidate_id
      Float :position
      Integer :vote_id
      DateTime :created_at
      DateTime :updated_at
    end
    
    create_table(:schema_info) do
      Integer :version, :default=>0, :null=>false
    end
    
    create_table(:users) do
      primary_key :id
      String :first_name, :size=>255
      String :last_name, :size=>255
      String :email_address, :size=>255
      String :encrypted_password, :size=>255
      TrueClass :dismissed_welcome_blurb
      TrueClass :admin, :default=>false
      TrueClass :dismissed_welcome_guide, :default=>false
      DateTime :created_at
      DateTime :updated_at
      String :password_reset_token, :text=>true
      DateTime :password_reset_token_generated_at
      TrueClass :guest, :default=>false
      TrueClass :email_enabled, :default=>true
    end
    
    create_table(:votes) do
      primary_key :id
      Integer :election_id
      Integer :user_id
      DateTime :created_at
      DateTime :updated_at
    end
  end
  
  down do
    drop_table(:candidate_comments, :candidates, :election_visits, :elections, :invitations, :mailing_list_entries, :majorities, :memberships, :organizations, :rankings, :schema_info, :users, :votes)
  end
end
