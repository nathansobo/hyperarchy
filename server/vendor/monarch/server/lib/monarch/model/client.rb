class Client < Model::Record
  column :jid, :string
  column :session_id, :string
  column :user_id, :string
end
