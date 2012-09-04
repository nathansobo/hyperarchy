class User < Prequel::Record
  column :id, :integer
  column :full_name, :string
  column :email_address, :string
  column :oauth_access_token, :string

  synthetic_column :email_hash, :string

  has_many :votes
  has_many :rankings
  has_many :questions
  has_many :answers, :foreign_key => :creator_id

  validates_uniqueness_of :email_address, :message => "There is already an account with that email address."

  def can_update_or_destroy?
    current_user == self
  end
  alias can_update? can_update_or_destroy?
  alias can_destroy? can_update_or_destroy?

  def create_whitelist
    [:full_name, :email_address, :password]
  end

  def update_whitelist
    [:full_name, :email_address, :password]
  end

  # dont send email address to another user unless they are an admin or owner
  def read_blacklist
    [:oauth_access_token]
  end

  def initial_repository_contents
    [self]
  end

  def email_hash
    Digest::MD5.hexdigest(email_address.downcase) if email_address
  end
end
