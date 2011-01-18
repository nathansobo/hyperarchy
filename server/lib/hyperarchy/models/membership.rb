class Membership < Monarch::Model::Record
  column :organization_id, :key
  column :user_id, :key
  column :invitation_id, :key
  column :role, :string, :default => "member"
  column :pending, :boolean, :default => true
  column :last_visited, :datetime
  column :notify_of_new_elections, :string, :default => "weekly"
  column :notify_of_new_candidates, :string, :default => "weekly"
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

  # dont send email address to another user unless they are an admin or owner
  def read_blacklist
    if user == current_user || current_user.admin? || user && current_user.owns_organization_with_member?(user)
      super
    else
      [:email_address]
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

  def wants_notifications?(period)
     wants_election_notifications?(period) || wants_candidate_notifications?(period)
  end

  def wants_candidate_notifications?(period)
    notify_of_new_candidates == period
  end

  def wants_election_notifications?(period)
    notify_of_new_elections == period
  end

  def new_candidates_in_period(period)
    user.votes.
      join_to(organization.elections).
      join_through(Candidate).
      where(Candidate[:created_at] > (last_alerted_or_visited_at(period))).
      where(Candidate[:creator_id].neq(user_id))
  end

  def new_elections_in_period(period)
    organization.elections.
      where(Election[:created_at] > last_alerted_or_visited_at(period)).
      where(Election[:creator_id].neq(user_id))
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

  # returns the time of last visit or the 1 <period> ago, whichever is more recent
  def last_alerted_or_visited_at(period)
    [period_ago(period), last_visited].max
  end

  def period_ago(period)
    case period
      when "hourly"
        1.hour.ago
      when "daily"
        1.day.ago
      when "weekly"
        1.week.ago
    end
  end
end
