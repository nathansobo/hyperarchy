class AddQuestionComments < ActiveRecord::Migration
  def up
    create_table :question_comments do |t|
        t.integer :id
        t.integer :question_id
        t.integer :creator_id
        t.string :body
        t.timestamps
    end
  end

  def down
    drop_table :question_comments
  end
end
