Sequel.migration do
  up do
    rename_column :candidates, :election_id, :question_id
    rename_column :election_visits, :election_id, :question_id
    rename_column :majorities, :election_id, :question_id
    rename_column :memberships, :notify_of_new_elections, :notify_of_new_questions
    rename_column :organizations, :election_count, :question_count
    rename_column :rankings, :election_id, :question_id
    rename_column :votes, :election_id, :question_id
    rename_column :election_comments, :election_id, :question_id

    rename_table :elections, :questions
    rename_table :election_comments, :question_comments
    rename_table :election_visits, :question_visits
  end
end

