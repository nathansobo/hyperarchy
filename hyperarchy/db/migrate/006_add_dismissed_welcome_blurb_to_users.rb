Sequel.migration do
  up do
    add_column :users, :dismissed_welcome_blurb, TrueClass
  end
end
