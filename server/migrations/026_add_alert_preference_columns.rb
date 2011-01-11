Sequel.migration do
  up do
    alter_table :memberships do
      add_column :election_alerts, String
      add_column :candidate_alerts, String
    end
  end

  down do
    alter_table :memberships do
      drop_column :election_alerts
      drop_column :candidate_alerts
    end
  end
end
