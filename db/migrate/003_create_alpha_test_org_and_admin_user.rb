Sequel.migration do
  up do
    require "bcrypt"
    admin_id = self[:users].insert(
      :first_name => "Hyperarchy",
      :last_name => "Admin",
      :email_address => "admin@hyperarchy.com",
      :encrypted_password => BCrypt::Password.create("admin").to_s
    )

    alpha_testers_id = self[:organizations].insert(:name => "Alpha Testers")

    self[:memberships].insert(
      :user_id => admin_id,
      :organization_id => alpha_testers_id,
      :role => "owner",
      :pending => false
    )
  end
end
