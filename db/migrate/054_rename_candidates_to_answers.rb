Sequel.migration do
  up do
    rename_column :candidate_comments, :candidate_id, :answer_id
    rename_column :memberships, :notify_of_new_candidates, :notify_of_new_answers
    rename_column :memberships, :notify_of_new_comments_on_own_candidates, :notify_of_new_comments_on_own_answers
    rename_column :memberships, :notify_of_new_comments_on_ranked_candidates, :notify_of_new_comments_on_ranked_answers
    rename_column :rankings, :candidate_id, :answer_id
    
    rename_table :candidates, :answers
    rename_table :candidate_comments, :answer_comments
  end
end

