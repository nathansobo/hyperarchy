Sequel.migration do
  up do
    require 'bcrypt'

    add_column :users, :guest, TrueClass, :default => false
    self[:users].update(:guest => false)

    self[:users].insert(
      :guest => true,
      :first_name => "Guest",
      :last_name => "User",
      :email_address => "guest@hyperarchy.com",
      :encrypted_password => BCrypt::Password.create("guest").to_s,
      :dismissed_welcome_blurb => true,
      :dismissed_welcome_guide => true,
      :admin => false,
      :created_at => Time.now,
      :updated_at => Time.now
    )
  end

  down do
    self[:users].filter(:guest => true).delete
    drop_column :users, :guest
  end
end
