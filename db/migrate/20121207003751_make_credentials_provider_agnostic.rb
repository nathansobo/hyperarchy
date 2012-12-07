class MakeCredentialsProviderAgnostic < ActiveRecord::Migration
  def up
    rename_column :users, :github_uid, :uid
    change_column :users, :uid, :string
    add_column :users, :provider, :string
    execute "update users set provider='github'"
  end

  def down
    rename_column :users, :uid, :github_uid
    drop_column :users, :provider
  end
end
