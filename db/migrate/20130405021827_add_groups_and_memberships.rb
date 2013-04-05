class AddGroupsAndMemberships < ActiveRecord::Migration
  def up
    create_table :groups do |t|
      t.string :name
      t.string :domain
      t.timestamps
    end

    create_table :memberships do |t|
      t.integer :group_id
      t.integer :user_id
      t.timestamps
    end
  end

  def down
    drop_table :groups
    drop_table :memberships
  end
end
