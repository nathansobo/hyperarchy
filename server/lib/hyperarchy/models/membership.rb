class Membership < Monarch::Model::Record
  column :organization_id, :key
  column :user_id, :key
  column :invitation_id, :key
  column :role, :string, :default => "member"
  column :pending, :boolean, :default => true
  column :last_visited, :datetime
  column :notify_of_new_elections, :boolean, :default => true
  column :notify_of_new_candidates, :boolean, :default => true
  column :created_at, :datetime
  column :updated_at, :datetime

  synthetic_column :first_name, :string
  synthetic_column :last_name, :string
  synthetic_column :email_address, :string

  belongs_to :organization
  belongs_to :user
  belongs_to :invitation

  attr_writer :email_address, :first_name, :last_name
  attr_accessor :suppress_invite_email
  delegate :email_address, :first_name, :last_name, :to => :user_details_delegate

  def current_user_is_admin_or_organization_owner?
    current_user.admin? || organization.has_owner?(current_user)
  end
  alias can_create? current_user_is_admin_or_organization_owner?
  alias can_destroy? current_user_is_admin_or_organization_owner?

  def can_update?
    current_user_is_admin_or_organization_owner? || user == current_user
  end

  def create_whitelist
    [:organization_id, :user_id, :role, :first_name, :last_name, :email_address, :notify_of_new_elections, :notify_of_new_candidates]
  end

  def update_whitelist
    if current_user_is_admin_or_organization_owner?
      [:first_name, :last_name, :role, :last_visited, :notify_of_new_elections, :notify_of_new_candidates]
    else
      [:last_visited, :notify_of_new_elections, :notify_of_new_candidates]
    end
  end

  def organization_ids
    [organization_id]
  end

  def email_address
    @email_address || (user_details_delegate ? user_details_delegate.email_address : nil)
  end

  def first_name
    @first_name || (user_details_delegate ? user_details_delegate.first_name : nil)
  end

  def last_name
    @last_name || (user_details_delegate ? user_details_delegate.last_name : nil)
  end

  def user_details_delegate
    if user
      user
    else
      invitation
    end
  end

  def before_create
    self.last_visited = Time.now

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

    to = email_address
    subject = invite_email_subject
    body = invite_email_body
    Hyperarchy.defer do
      Mailer.send(:to => to, :subject => subject, :body => body)
    end
  end

  protected
  def invite_email_subject
    "#{current_user.full_name} has invited you to join #{organization.name} on Hyperarchy"
  end

  def invite_email_body
    if invitation
      %[#{HYPERARCHY_BLURB}

Visit #{invitation.signup_url} to join our private alpha test and start voting on issues for #{organization.name}.]
    else
      %[Visit http://#{HTTP_HOST}/confirm_membership/#{id} to become a member of #{organization.name}.]
    end
  end
end
