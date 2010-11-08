class Membership < Monarch::Model::Record
  column :organization_id, :key
  column :user_id, :key
  column :invitation_id, :key
  column :role, :string, :default => "member"
  column :pending, :boolean, :default => true

  synthetic_column :first_name, :string
  synthetic_column :last_name, :string
  synthetic_column :email_address, :string

  belongs_to :organization
  belongs_to :user
  belongs_to :invitation

  attr_writer :email_address, :first_name, :last_name
  attr_accessor :suppress_invite_email
  delegate :email_address, :first_name, :last_name, :to => :user_details_delegate


  def can_mutate?
    current_user.admin? || organization.has_owner?(current_user)
  end
  alias can_create? can_mutate?
  alias can_update? can_mutate?
  alias can_destroy? can_mutate?

  def create_whitelist
    [:organization_id, :user_id, :role]
  end

  def update_whitelist
    [:role]
  end

  def organization_ids
    [organization_id]
  end

  def email_address
    @email_address || user_details_delegate.email_address
  end

  def first_name
    @first_name || user_details_delegate.first_name
  end

  def last_name
    @last_name || user_details_delegate.last_name
  end

  def user_details_delegate
    if user
      user
    else
      invitation
    end
  end

  def before_create
    if user = User.find(:email_address => email_address)
      self.user = user
    else
      self.invitation =
        Invitation.find(:sent_to_address => email_address) ||
          Invitation.create!(:sent_to_address => email_address,
                             :first_name => first_name,
                             :last_name => last_name,
                             :inviter => current_user)
    end
  end

  def after_create
    return unless pending?
    return if suppress_invite_email
    Mailer.send(
      :to => email_address,
      :subject => invite_email_subject,
      :body => invite_email_body
    )
  end

  protected
  def invite_email_subject
    "#{current_user.full_name} has invited you to join #{organization.name} on Hyperarchy"
  end

  def invite_email_body
    if invitation
      %[#{HYPERARCHY_BLURB}

Visit #{Mailer.base_url}/signup?invitation_code=#{invitation.guid} to join our private alpha test and start voting on issues for #{organization.name}.]
    else
      %[Visit #{Mailer.base_url}/confirm_membership/#{id} to become a member of #{organization.name}.]
    end
  end
end
