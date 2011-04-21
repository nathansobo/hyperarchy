Sequel.migration do
  up do
    alter_table :memberships do
      add_column :notify_of_new_comments_on_own_candidates, String
      add_column :notify_of_new_comments_on_ranked_candidates, String
    end

    execute %{
      update memberships
      set notify_of_new_comments_on_own_candidates = 'daily',
          notify_of_new_comments_on_ranked_candidates = notify_of_new_candidates
    }
  end

  down do
    alter_table :memberships do
      drop_column :notify_of_new_comments_on_own_candidates
      drop_column :notify_of_new_comments_on_ranked_candidates
    end
  end
end
