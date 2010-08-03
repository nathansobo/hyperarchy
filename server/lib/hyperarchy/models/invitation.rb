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

  attr_accessor :send_email

  def before_create
    self.guid = Guid.new.to_s
  end
  
  def after_create
    return unless send_email
    Mailer.send(
      :to => sent_to_address,
      :subject => "#{inviter.full_name} has invited you to join Hyperarchy",
      :body => invite_email_body
    )
  end

  def email_address
    sent_to_address
  end

  def redeem(attributes)
    raise "Already redeemed" if redeemed?

    confirm_memberships = (attributes[:confirm_memberships] || []).map(&:to_i)

    user = User.new(attributes[:user])
    if user.valid?
      user.save
    else
      return user
    end
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

  def signup_url
    "#{Mailer.base_url}/signup?invitation_code=#{guid}"
  end

  protected
  def invite_email_body
    %[#{HYPERARCHY_BLURB}

Visit #{signup_url} to sign as an alpha tester. You can then add your organization and invite your colleagues to vote with you.]
  end
end