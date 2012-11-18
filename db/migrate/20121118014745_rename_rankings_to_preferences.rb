class RenameRankingsToPreferences < ActiveRecord::Migration
  def up
    rename_table :rankings, :preferences
  end

  def down
    rename_table :preferences, :rankings
  end
end
