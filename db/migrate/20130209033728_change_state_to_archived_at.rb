class ChangeStateToArchivedAt < ActiveRecord::Migration
  def change
    remove_column :questions, :state
    add_column :questions, :archived_at, :datetime
  end
end
