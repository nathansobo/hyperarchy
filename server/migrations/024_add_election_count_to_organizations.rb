Sequel.migration do
  up do
    add_column :organizations, :election_count, Integer, :default => 0
    self[:organizations].each do |organization|
      org_id = organization[:id]
      election_count = self[:elections].filter(:organization_id => org_id).count
      self[:organizations].filter(:id => org_id).update(:election_count => election_count)
    end
  end

  down do
    drop_column :organizations, :election_count
  end
end
