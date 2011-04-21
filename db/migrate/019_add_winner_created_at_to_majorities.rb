Sequel.migration do
  up do
    add_column :majorities, :winner_created_at, Time
    execute %{
      update majorities set winner_created_at = candidates.created_at
      from candidates
      where majorities.winner_id = candidates.id;
    }
  end

  down do
    drop_column :majorities, :winner_created_at
  end
end
