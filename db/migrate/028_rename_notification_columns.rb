Sequel.migration do
  up do
    alter_table :memberships do
      rename_column :election_alerts, :notify_of_new_elections
      rename_column :candidate_alerts, :notify_of_new_candidates
    end
  end
end
