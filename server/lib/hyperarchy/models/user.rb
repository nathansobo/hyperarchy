class User < Monarch::Model::Record
  column :first_name, :string
  column :last_name, :string
  column :email_address, :string
  column :encrypted_password, :string
  column :admin, :boolean
  column :dismissed_welcome_blurb, :boolean, :default => false
  column :dismissed_welcome_guide, :boolean, :default => false

  def self.encrypt_password(unencrypted_password)
    BCrypt::Password.create(unencrypted_password).to_s
  end

  has_many :memberships
  relates_to_many :organizations do
    memberships.join_through(Organization)
  end

  relates_to_many :elections do
    Election.table
  end

  relates_to_many :candidates do
    Candidate.table
  end


  def can_update_or_destroy?
    current_user.admin? || current_user == self
  end
  alias can_update? can_update_or_destroy?
  alias can_destroy? can_update_or_destroy?

  def update_whitelist
    list = [:first_name, :last_name, :email_address]
    list.push(:admin) if current_user.admin?
    list
  end

  def after_create
    if RACK_ENV =~ /production|demo/
      Hyperarchy.defer do
        Mailer.send(
          :to => "admin@hyperarchy.com",
          :subject => "New Hyperarchy User On #{RACK_ENV.capitalize}",
          :body => "Name: #{full_name}\nEmail Address: #{email_address}\n"
        )
      end
    end
  end

  def organization_ids
    memberships.map(&:organization_id)
  end

  def password=(unencrypted_password)
    return nil if unencrypted_password.blank?
    self.encrypted_password = self.class.encrypt_password(unencrypted_password)
  end

  def password
    return nil if encrypted_password.blank?
    BCrypt::Password.new(encrypted_password)
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

  def last_visited_organization
    memberships.order_by(Membership[:last_visited].desc).first.organization
  end
end
