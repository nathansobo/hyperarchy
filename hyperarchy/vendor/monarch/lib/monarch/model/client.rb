module Monarch
  class Client < Monarch::Model::Record
    column :jid, :string
    column :session_id, :string
    column :user_id, :string

    belongs_to :user

    def session
      Session.find(Session[:session_id].eq(session_id))
    end
  end
end