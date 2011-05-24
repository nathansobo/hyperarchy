Sequel.migration do
  up do
    require 'bcrypt'

    # make the existing guest user a member of the social organization
    social_org_id = self[:organizations].filter(:social => true).first[:id]
    guest_user_id = self[:users].filter(:guest => true).first[:id]
    self[:memberships].insert(:user_id => guest_user_id,
                              :organization_id => social_org_id,
                              :pending => false)

    # for every non-social organization, create a new guest member
    self[:organizations].filter(:social => false).each do |organization|
      org_id = organization[:id]
      guest_user_id = self[:users].insert(
        :guest => true,
        :first_name => "Guest",
        :last_name => "User#{org_id}",
        :email_address => "guest#{org_id}@hyperarchy.com",
        :encrypted_password => BCrypt::Password.create("guest").to_s,
        :dismissed_welcome_blurb => true,
        :dismissed_welcome_guide => true,
        :admin => false,
        :created_at => Time.now,
        :updated_at => Time.now
      )
      
      self[:memberships].insert(:user_id => guest_user_id,
                                :organization_id => org_id,
                                :pending => false)
    end
  end

  down do
    require 'bcrypt'

    self[:users].filter(:guest => true).each do |guest_user|
      self[:memberships].filter(:user_id => guest_user[:id]).delete
      self[:users].filter(:id => guest_user[:id]).delete
    end

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
end
