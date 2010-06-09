class Invitation < Monarch::Model::Record
  column :guid, :string
  column :sent_to_address, :string
  column :first_name, :string
  column :last_name, :string
  column :redeemed, :boolean
  column :inviter_id, :key
  column :invitee_id, :key

  belongs_to :inviter, :class_name => "User"
  belongs_to :invitee, :class_name => "User"
  has_many :memberships

  def before_create
    self.guid = Guid.new.to_s
  end

  def redeem(attributes)
    raise "Already redeemed" if redeemed?

    confirm_memberships = attributes.delete(:confirm_memberships)
    user = User.create!(attributes)
    self.invitee = user
    self.redeemed = true
    save

    memberships.each do |membership|
      if confirm_memberships.include?(membership.id)
        membership.update(:pending => false, :user => user)
      else
        membership.destroy
      end
    end
    user
  end
end