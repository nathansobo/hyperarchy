class Identity < Prequel::Record
  include OmniAuth::Identity::Model
  include OmniAuth::Identity::SecurePassword

  column :id, :integer
  column :full_name, :string
  column :email_address, :string
  column :password_digest, :string
  column :created_at, :datetime
  column :updated_at, :datetime
  attr_accessor :password_confirmation

  validates_uniqueness_of :email_address
  has_secure_password

  def self.locate(search_hash)
    find(:email_address => search_hash)
  end

  def info
    {
      :name => full_name,
      :email => email_address
    }
  end
end
