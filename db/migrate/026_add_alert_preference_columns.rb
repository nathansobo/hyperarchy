Sequel.migration do
  up do
    alter_table :memberships do
      add_column :election_alerts, String
      add_column :candidate_alerts, String
    end

    self[:memberships].filter(:notify_of_new_elections => true).update(:election_alerts => "daily")
    self[:memberships].filter(:notify_of_new_elections => false).update(:election_alerts => "weekly")
    self[:memberships].filter(:notify_of_new_candidates => true).update(:candidate_alerts => "daily")
    self[:memberships].filter(:notify_of_new_candidates => false).update(:candidate_alerts => "weekly")
  end

  down do
    alter_table :memberships do
      drop_column :election_alerts
      drop_column :candidate_alerts
    end
  end
end
