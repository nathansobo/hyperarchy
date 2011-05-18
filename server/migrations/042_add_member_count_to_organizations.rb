Sequel.migration do
  up do
    add_column :organizations, :member_count, Integer, :default => 0
    self[:organizations].each do |org|
      num_members = self[:memberships].filter(:organization_id => org[:id]).count
      self[:organizations].filter(:id => org[:id]).update(:member_count => num_members)
    end
  end

  down do
    drop_column :organizations, :member_count
  end
end

