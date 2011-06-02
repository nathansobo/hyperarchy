Sequel.migration do
  up do
    drop_table :invitations
  end

  down do
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
  end
end

