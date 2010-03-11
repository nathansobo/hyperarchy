class User < Model::Record
  column :full_name, :string
  column :email_address, :string
  column :encrypted_password, :string

  def self.encrypt_password(unencrypted_password)
    BCrypt::Password.create(unencrypted_password).to_s
  end

  relates_to_many :elections do
    Election.table
  end

  relates_to_many :candidates do
    Candidate.table
  end

  def password=(unencrypted_password)
    self.encrypted_password = self.class.encrypted_password(unencrypted_password)
  end

  def password
    BCrypt::Password.new(encrypted_password)
  end
end
