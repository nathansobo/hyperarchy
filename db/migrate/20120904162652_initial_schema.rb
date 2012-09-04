class InitialSchema < ActiveRecord::Migration
  def up
    create_table :answers do |t|
      t.string :body
      t.integer :question_id
      t.integer :creator_id
      t.integer :position
      t.integer :comment_count
      t.timestamps
    end

    create_table :majorities do |t|
      t.integer :question_id
      t.integer :winner_id
      t.integer :loser_id
      t.integer :pro_count, :default => 0
      t.integer :con_count, :default => 0
      t.datetime :winner_created_at
    end

    create_table :questions do |t|
      t.integer :organization_id
      t.integer :creator_id
      t.string :body
      t.string :details
      t.integer :vote_count
      t.float :score
      t.timestamps
    end

    create_table :rankings do |t|
      t.integer :user_id
      t.integer :question_id
      t.integer :answer_id
      t.integer :vote_id
      t.float :position
      t.timestamps
    end

    create_table :users do |t|
      t.string :full_name
      t.string :email_address
      t.string :oauth_access_token
    end

    create_table :votes do |t|
      t.integer :user_id
      t.integer :question_id
      t.timestamps
    end
  end

  def down
    drop_table :answers
    drop_table :majorities
    drop_table :questions
    drop_table :rankings
    drop_table :users
    drop_table :votes
  end
end
