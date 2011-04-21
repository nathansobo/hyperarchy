Sequel.migration do
  up do
    add_column :organizations, :social, TrueClass, :default => false
    self[:organizations].filter(:id => 1).update(:social => true, :name => "Hyperarchy Social")
  end

  down do
    drop_column :organizations, :social
  end
end
