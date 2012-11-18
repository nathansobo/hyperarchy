class Preference < Prequel::Record
  column :id, :integer
  column :user_id, :integer
  column :question_id, :integer
  column :answer_id, :integer
  column :ranking_id, :integer
  column :position, :float
  column :created_at, :datetime
  column :updated_at, :datetime

  belongs_to :user
  belongs_to :answer
  belongs_to :question
  belongs_to :ranking

  attr_accessor :suppress_ranking_update

  def can_create_or_update?
    false
  end
  alias can_create? can_create_or_update?
  alias can_update? can_create_or_update?

  def can_destroy?
    user_id == current_user.id
  end

  def before_create
    self.question_id = answer.question_id
    question.lock
    self.ranking = question.rankings.find_or_create(:user_id => user_id)
    ranking.updated
  end

  def after_create
    if position > 0
      increment_victories_over(lower_positive_preferences_by_same_user)
      decrement_defeats_by(lower_positive_preferences_by_same_user)
      increment_victories_over(answers_not_ranked_by_same_user)
    else
      increment_defeats_by(higher_negative_preferences_by_same_user)
      decrement_victories_over(higher_negative_preferences_by_same_user)
      increment_defeats_by(answers_not_ranked_by_same_user)
    end

    question.compute_global_ranking
    question.unlock
  end

  def before_update(changeset)
    question.lock
  end

  def after_update(changeset)
    return unless changeset.changed?(:position)
    old_position = changeset.old(:position)
    if position > old_position
      after_preference_moved_up(old_position)
    else
      after_preference_moved_down(old_position)
    end

    question.rankings.find(:user_id => user_id).updated
    question.compute_global_ranking
    question.unlock
  end

  def after_preference_moved_up(old_position)
    previously_higher_preferences = lower_preferences_by_same_user.where(:position.gt(old_position))

    increment_victories_over(previously_higher_preferences)
    decrement_defeats_by(previously_higher_preferences)

    if position > 0 && old_position < 0
      increment_victories_over(answers_not_ranked_by_same_user)
      decrement_defeats_by(answers_not_ranked_by_same_user)
    end
  end

  def after_preference_moved_down(old_position)
    previously_lower_preferences = higher_preferences_by_same_user.where(:position.lt(old_position))
    decrement_victories_over(previously_lower_preferences)
    increment_defeats_by(previously_lower_preferences)

    if position < 0 && old_position > 0
      decrement_victories_over(answers_not_ranked_by_same_user)
      increment_defeats_by(answers_not_ranked_by_same_user)
    end
  end

  def before_destroy
    question.lock
  end

  def after_destroy
    if position > 0
      decrement_victories_over(lower_positive_preferences_by_same_user)
      increment_defeats_by(lower_positive_preferences_by_same_user)
      decrement_victories_over(answers_not_ranked_by_same_user)
    else
      increment_victories_over(higher_negative_preferences_by_same_user)
      decrement_defeats_by(higher_negative_preferences_by_same_user)
      decrement_defeats_by(answers_not_ranked_by_same_user)
    end

    if preferences_by_same_user.empty?
      ranking.destroy
    elsif !suppress_ranking_update
      ranking.updated
    end
    question.compute_global_ranking
    question.unlock
  end

  def increment_victories_over(preferences_or_answers)
    victories_over(preferences_or_answers).increment(:pro_count)
    defeats_by(preferences_or_answers).increment(:con_count)
  end

  def decrement_victories_over(preferences_or_answers)
    victories_over(preferences_or_answers).decrement(:pro_count)
    defeats_by(preferences_or_answers).decrement(:con_count)
  end

  def increment_defeats_by(preferences_or_answers)
    defeats_by(preferences_or_answers).increment(:pro_count)
    victories_over(preferences_or_answers).increment(:con_count)
  end

  def decrement_defeats_by(preferences_or_answers)
    defeats_by(preferences_or_answers).decrement(:pro_count)
    victories_over(preferences_or_answers).decrement(:con_count)
  end

  def victories_over(preferences_or_answers)
    majorities_where_ranked_answer_is_winner.
      join(preferences_or_answers, :loser_id => answer_id_join_column(preferences_or_answers))
  end

  def defeats_by(preferences_or_answers)
    majorities_where_ranked_answer_is_loser.
      join(preferences_or_answers, :winner_id => answer_id_join_column(preferences_or_answers))
  end

  def answer_id_join_column(preferences_or_answers)
    preferences_or_answers.get_column(:answer_id) ? :answer_id : Answer[:id]
  end

  def preferences_by_same_user
    Preference.where(:user_id => user_id, :question_id => question_id)
  end

  def higher_preferences_by_same_user
    preferences_by_same_user.where(:position.gt(position))
  end

  def lower_preferences_by_same_user
    preferences_by_same_user.where(:position.lt(position))
  end

  def positive_preferences_by_same_user
    preferences_by_same_user.where(:position.gt(0))
  end

  def negative_preferences_by_same_user
    preferences_by_same_user.where(:position.lt(0))
  end

  def higher_positive_preferences_by_same_user
    positive_preferences_by_same_user.where(:position.gt(position))
  end

  def lower_positive_preferences_by_same_user
    positive_preferences_by_same_user.where(:position.lt(position))
  end

  def higher_negative_preferences_by_same_user
    negative_preferences_by_same_user.where(:position.gt(position))
  end

  def lower_negative_preferences_by_same_user
    negative_preferences_by_same_user.where(:position.lt(position))
  end

  def majorities_where_ranked_answer_is_winner
    Majority.where(:winner_id => answer_id)
  end

  def majorities_where_ranked_answer_is_loser
    Majority.where(:loser_id => answer_id)
  end

  def all_preferences_for_same_answer
    Preference.where(:answer_id => answer_id)
  end

  def all_answers_in_question
    Answer.where(:question_id => question_id)
  end

  def answers_not_ranked_by_same_user
    all_answers_in_question.
      left_join(preferences_by_same_user).
      where(Preference[:id] => nil).
      project(Answer)
  end
end
