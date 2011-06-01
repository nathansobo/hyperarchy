Sequel.migration do
  up do
    add_column :users, :default_guest, TrueClass, :default => false
    execute(%{
      update users
      set default_guest = 't'
      from
       (select user_id, count(*) as count from memberships group by user_id) as membership_counts
      where
        users.guest = 't'
        and users.id = membership_counts.user_id
        and membership_counts.count = 1;
    })
  end

  down do
    drop_column :users, :default_guest
  end
end

