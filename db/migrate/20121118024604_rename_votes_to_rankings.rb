class RenameVotesToRankings < ActiveRecord::Migration
  def up
    rename_table :votes, :rankings
    rename_column :preferences, :vote_id, :ranking_id
    rename_column :questions, :vote_count, :ranking_count
  end

  def down
    rename_table :rankings, :votes
    rename_column :preferences, :ranking_id, :vote_id
    rename_column :questions, :ranking_count, :vote_count
  end
end
