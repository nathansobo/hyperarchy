class AddSuperusers < ActiveRecord::Migration
  def up
    add_column :users, :superuser, :boolean, :default => false
    add_column :users, :superuser_enabled, :boolean, :default => false
  end

  def down
    drop_column :users, :superuser
    drop_column :users, :superuser_enabled
  end
end
