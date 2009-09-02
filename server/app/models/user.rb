class User < Model::Tuple
  attribute :full_name, :string
  attribute :email_address, :string
  attribute :encrypted_password, :string

  relates_to_many :blogs do
    Blog.set
  end

  relates_to_many :candidates do
    Candidate.set
  end

  def password=(unencrypted_password)
    self.encrypted_password = BCrypt::Password.create(unencrypted_password).to_s
  end

  def password
    BCrypt::Password.new(encrypted_password)
  end
end
