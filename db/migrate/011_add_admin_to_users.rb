Sequel.migration do
  up do
    add_column(:users, :admin, TrueClass, :default => false)
    self[:users].filter(:email_address => "admin@hyperarchy.com").update(:admin => true)
  end
end
