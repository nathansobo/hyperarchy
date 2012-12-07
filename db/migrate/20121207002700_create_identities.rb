class CreateIdentities < ActiveRecord::Migration
  def change
    create_table :identities do |t|
      t.string :full_name
      t.string :email_address
      t.string :password_digest

      t.timestamps
    end
  end
end
