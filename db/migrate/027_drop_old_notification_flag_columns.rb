Sequel.migration do
  up do
    alter_table :memberships do
      drop_column :notify_of_new_elections
      drop_column :notify_of_new_candidates
    end
  end
end
