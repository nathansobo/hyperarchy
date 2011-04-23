Sequel.migration do
  up do
    add_column :users, :email_enabled, TrueClass, :default => true
  end
end

