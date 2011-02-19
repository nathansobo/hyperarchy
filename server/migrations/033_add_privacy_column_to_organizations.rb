Sequel.migration do
  up do
    add_column :organizations, :privacy, String, :default => "read_only"
    self[:organizations].update(:privacy => "read_only")
    self[:organizations].filter(:social => true).update(:privacy => "public")
  end

  down do
    drop_column :organizations, :privacy
  end
end
