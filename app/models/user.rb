class User < Prequel::Record
  column :id, :integer
  column :first_name, :string
  column :last_name, :string
  column :email_address, :string
  column :encrypted_password, :string
  column :admin, :boolean
  column :dismissed_welcome_blurb, :boolean, :default => false
  column :dismissed_welcome_guide, :boolean, :default => false
  column :password_reset_token, :string
  column :password_reset_token_generated_at, :datetime
  column :guest, :boolean, :default => false
  synthetic_column :email_hash, :string

  has_many :memberships
  has_many :election_visits
  has_many :votes
  has_many :rankings
  has_many :elections
  has_many :candidates, :foreign_key => :creator_id

  def organizations
    memberships.join_through(Organization)
  end

  def owned_organizations
    memberships.where(:role => "owner").join_through(Organization)
  end

  validates_uniqueness_of :email_address, :message => "There is already an account with that email address."

  def self.encrypt_password(unencrypted_password)
    BCrypt::Password.create(unencrypted_password).to_s
  end

  def self.users_to_notify(period)
    Membership.where_any(
      :notify_of_new_elections => period,
      :notify_of_new_candidates => period,
      :notify_of_new_comments_on_own_candidates => period,
      :notify_of_new_comments_on_ranked_candidates => period
    ).join_through(User)
  end

  def self.guest
    find(:guest => true)
  end

  def can_update_or_destroy?
    current_user.admin? || current_user == self
  end
  alias can_update? can_update_or_destroy?
  alias can_destroy? can_update_or_destroy?

  def create_whitelist
    [:first_name, :last_name, :email_address, :password]
  end 

  def update_whitelist
    list = [:first_name, :last_name, :email_address]
    list.push(:admin) if current_user.admin?
    list
  end

  # dont send email address to another user unless they are an admin or owner
  def read_blacklist
    if current_user_can_read_email_address?
      [:encrypted_password]
    else
      [:email_address, :encrypted_password]
    end
  end

  def current_user_can_read_email_address?
    return false unless current_user
    self == current_user || current_user.admin? || current_user.owns_organization_with_member?(self)
  end

  def owns_organization_with_member?(user)
    !owned_organizations.join_through(user.memberships).empty?
  end

  def after_create
    if Rails.env =~ /production|demo/
      Hyperarchy.defer do
        Mailer.send(
          :to => "nathan@hyperarchy.com",
          :subject => "New Hyperarchy User On #{Rails.env.capitalize}",
          :body => "Name: #{full_name}\nEmail Address: #{email_address}\n"
        )
      end
    end

    memberships.create!(:organization => Organization.social, :pending => false)
  end

  def organization_ids
    memberships.map(&:organization_id)
  end

  def initial_repository_contents
    [self] + memberships.all  + initial_repository_organizations
  end

  def initial_repository_organizations
    if admin?
      Organization.all
    elsif guest?
      Organization.where(Organization[:privacy].neq('private')).all
    else
      Organization.where(Organization[:privacy].neq('private')).all +
        memberships.join_through(Organization.where(:privacy => 'private')).all
    end
  end

  def password=(unencrypted_password)
    return nil if unencrypted_password.blank?
    self.encrypted_password = self.class.encrypt_password(unencrypted_password)
  end

  def password
    return nil if encrypted_password.blank?
    BCrypt::Password.new(encrypted_password)
  end

  def generate_password_reset_token
    update!(
      :password_reset_token => ActiveSupport::SecureRandom.hex(8),
      :password_reset_token_generated_at => Time.now
    )
  end

  def email_hash
    Digest::MD5.hexdigest(email_address.downcase)
  end

  def full_name
    "#{first_name} #{last_name}"
  end

  def validate
    errors.add(:first_name, "You must enter a first name.") if first_name.blank?
    errors.add(:last_name, "You must enter a last name.") if last_name.blank?
    errors.add(:email_address, "You must enter an email address.") if email_address.blank?
    errors.add(:password, "You must enter a password.") if encrypted_password.blank?
  end

  def default_organization
    if memberships.empty?
      Organization.find(:social => true)    
    else
      memberships.order_by(Membership[:last_visited].desc).first.organization
    end
  end

  def memberships_to_notify(period)
    memberships.
      join(Organization).
      order_by(:social).
      project(Membership).
      all.
      select {|m| m.wants_notifications?(period)}
  end
end
