class Membership < Monarch::Model::Record
  column :organization_id, :key
  column :user_id, :key
  column :invitation_id, :key
  column :role, :string
  column :pending, :boolean

  belongs_to :organization
  belongs_to :user
  belongs_to :invitation

  attr_accessor :email_address

  def before_create
    if user = User.find(:email_address => email_address)
      self.user = user
      self.pending = false
    else
      self.pending = true
      self.invitation = Invitation.create!(:sent_to_address => email_address, :inviter => current_user)
    end
  end
end
