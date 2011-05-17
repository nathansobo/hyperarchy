class User < Monarch::Model::Record
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
  column :email_enabled, :boolean, :default => true
  synthetic_column :email_hash, :string

  has_many :memberships
  has_many :election_visits
  has_many :votes
  has_many :rankings

  relates_to_many :organizations do
    memberships.join_through(Organization)
  end

  relates_to_many :owned_organizations do
    memberships.where(:role => "owner").join_through(Organization)
  end

  relates_to_many :elections do
    Election.where(:creator_id => field(:id))
  end

  relates_to_many :candidates do
    Candidate.where(:creator_id => field(:id))
  end

  validates_uniqueness_of :email_address, :message => "There is already an account with that email address." 

  def self.encrypt_password(unencrypted_password)
    BCrypt::Password.create(unencrypted_password).to_s
  end

  def self.create_guest(organization_id=nil)
    self.create(:guest => true,
                :first_name => "Guest",
                :last_name  => "User#{organization_id}",
                :email_address => "guest#{organization_id}@hyperarchy.com",
                :email_enabled => false,
                :password => "guest_password")
  end

  def self.guest
    Organization.social.guest
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
    if RACK_ENV =~ /production|demo/
      Hyperarchy.defer do
        Mailer.send(
          :to => "nathan@hyperarchy.com",
          :subject => "New Hyperarchy User On #{RACK_ENV.capitalize}",
          :body => "Name: #{full_name}\nEmail Address: #{email_address}\n"
        )
      end
    end
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
      :password_reset_token => SecureRandom.hex(8),
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
    validation_error(:first_name, "You must enter a first name.") if first_name.blank?
    validation_error(:last_name, "You must enter a last name.") if last_name.blank?
    validation_error(:email_address, "You must enter an email address.") if email_address.blank?
    validation_error(:encrypted_password, "You must enter a password.") if encrypted_password.blank?
  end

  def default_organization
    if memberships.empty?
      Organization.find(:social => true)    
    else
      memberships.order_by(Membership[:last_visited].desc).first.organization
    end
  end
end
