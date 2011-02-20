class Invitation < Monarch::Model::Record
  column :guid, :string
  column :sent_to_address, :string
  column :first_name, :string, :default => ""
  column :last_name, :string, :default => ""
  column :redeemed, :boolean
  column :inviter_id, :key
  column :invitee_id, :key
  column :created_at, :datetime
  column :updated_at, :datetime

  belongs_to :inviter, :class_name => "User"
  belongs_to :invitee, :class_name => "User"
  has_many :memberships
  relates_to_many :organizations do
    memberships.join_through(Organization)
  end

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

  def redeem(user_attributes)
    raise "Already redeemed" if redeemed?

    user = User.new(user_attributes)
    if user.valid?
      user.save
    else
      return user
    end
    self.invitee = user
    self.redeemed = true
    save

    memberships.each do |membership|
      membership.update!(:pending => false, :user => user)
    end
    user
  end

  def signup_url
    "https://#{HTTP_HOST}/signup?invitation_code=#{guid}"
  end

  protected
  def invite_email_body
    %[#{HYPERARCHY_BLURB}

Visit #{signup_url} to sign as an alpha tester. You can then add your organization and invite your colleagues to vote with you.]
  end
end