class AddQuestionPermissions < ActiveRecord::Migration
  def change
    add_column :questions, :secret, :string
    create_table :question_permissions do |t|
      t.string :secret
      t.integer :question_id
      t.integer :user_id
    end
  end
end
