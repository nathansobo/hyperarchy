Sequel.migration do
  up do
    self[:users].filter(:guest => true).update(:email_enabled => false)
    ["test@test.com", "jarod333@example.com", "newguy@new.com", "heather.moore@grockit.com", "esanchez@pivotallabs.com"].each do |bad_email|
      self[:users].filter(:email_address => bad_email).update(:email_enabled => false)
    end
  end
end
