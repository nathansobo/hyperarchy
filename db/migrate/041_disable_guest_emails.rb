Sequel.migration do
  up do
    self[:users].filter(:guest => true).update(:email_enabled => false)
  end
end

