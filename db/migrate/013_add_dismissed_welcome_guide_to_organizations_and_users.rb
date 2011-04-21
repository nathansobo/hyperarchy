Sequel.migration do
  up do
    add_column(:organizations, :dismissed_welcome_guide, TrueClass, :default => false)
    add_column(:users, :dismissed_welcome_guide, TrueClass, :default => false)
    self[:organizations].update(:dismissed_welcome_guide => true)
    self[:users].update(:dismissed_welcome_guide => true)
  end
end
