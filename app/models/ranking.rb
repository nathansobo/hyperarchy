#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

class Ranking < Prequel::Record
  column :id, :integer
  column :user_id, :integer
  column :question_id, :integer
  column :answer_id, :integer
  column :vote_id, :integer
  column :position, :float
  column :created_at, :datetime
  column :updated_at, :datetime

  belongs_to :user
  belongs_to :answer
  belongs_to :question
  belongs_to :vote

  attr_accessor :suppress_vote_update

  def can_create_or_update?
    false
  end
  alias can_create? can_create_or_update?
  alias can_update? can_create_or_update?

  def can_destroy?
    user_id == current_user.id
  end

  def organization_ids
    question ? question.organization_ids : []
  end

  def before_create
    self.question_id = answer.question_id
    question.lock
    self.vote = question.votes.find_or_create(:user_id => user_id)
    vote.updated
  end

  def after_create
    if position > 0
      increment_victories_over(lower_positive_rankings_by_same_user)
      decrement_defeats_by(lower_positive_rankings_by_same_user)
      increment_victories_over(answers_not_ranked_by_same_user)
    else
      increment_defeats_by(higher_negative_rankings_by_same_user)
      decrement_victories_over(higher_negative_rankings_by_same_user)
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
      after_ranking_moved_up(old_position)
    else
      after_ranking_moved_down(old_position)
    end

    question.votes.find(:user_id => user_id).updated
    question.compute_global_ranking
    question.unlock
  end

  def after_ranking_moved_up(old_position)
    previously_higher_rankings = lower_rankings_by_same_user.where(:position.gt(old_position))

    increment_victories_over(previously_higher_rankings)
    decrement_defeats_by(previously_higher_rankings)

    if position > 0 && old_position < 0
      increment_victories_over(answers_not_ranked_by_same_user)
      decrement_defeats_by(answers_not_ranked_by_same_user)
    end
  end

  def after_ranking_moved_down(old_position)
    previously_lower_rankings = higher_rankings_by_same_user.where(:position.lt(old_position))
    decrement_victories_over(previously_lower_rankings)
    increment_defeats_by(previously_lower_rankings)

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
      decrement_victories_over(lower_positive_rankings_by_same_user)
      increment_defeats_by(lower_positive_rankings_by_same_user)
      decrement_victories_over(answers_not_ranked_by_same_user)
    else
      increment_victories_over(higher_negative_rankings_by_same_user)
      decrement_defeats_by(higher_negative_rankings_by_same_user)
      decrement_defeats_by(answers_not_ranked_by_same_user)
    end

    if rankings_by_same_user.empty?
      vote.destroy
    elsif !suppress_vote_update
      vote.updated
    end
    question.compute_global_ranking
    question.unlock
  end

  def increment_victories_over(rankings_or_answers)
    victories_over(rankings_or_answers).increment(:pro_count)
    defeats_by(rankings_or_answers).increment(:con_count)
  end

  def decrement_victories_over(rankings_or_answers)
    victories_over(rankings_or_answers).decrement(:pro_count)
    defeats_by(rankings_or_answers).decrement(:con_count)
  end

  def increment_defeats_by(rankings_or_answers)
    defeats_by(rankings_or_answers).increment(:pro_count)
    victories_over(rankings_or_answers).increment(:con_count)
  end

  def decrement_defeats_by(rankings_or_answers)
    defeats_by(rankings_or_answers).decrement(:pro_count)
    victories_over(rankings_or_answers).decrement(:con_count)
  end

  def victories_over(rankings_or_answers)
    majorities_where_ranked_answer_is_winner.
      join(rankings_or_answers, :loser_id => answer_id_join_column(rankings_or_answers))
  end

  def defeats_by(rankings_or_answers)
    majorities_where_ranked_answer_is_loser.
      join(rankings_or_answers, :winner_id => answer_id_join_column(rankings_or_answers))
  end

  def answer_id_join_column(rankings_or_answers)
    rankings_or_answers.get_column(:answer_id) ? :answer_id : Answer[:id]
  end

  def rankings_by_same_user
    Ranking.where(:user_id => user_id, :question_id => question_id)
  end

  def higher_rankings_by_same_user
    rankings_by_same_user.where(:position.gt(position))
  end

  def lower_rankings_by_same_user
    rankings_by_same_user.where(:position.lt(position))
  end

  def positive_rankings_by_same_user
    rankings_by_same_user.where(:position.gt(0))
  end

  def negative_rankings_by_same_user
    rankings_by_same_user.where(:position.lt(0))
  end 

  def higher_positive_rankings_by_same_user
    positive_rankings_by_same_user.where(:position.gt(position))
  end

  def lower_positive_rankings_by_same_user
    positive_rankings_by_same_user.where(:position.lt(position))
  end

  def higher_negative_rankings_by_same_user
    negative_rankings_by_same_user.where(:position.gt(position))
  end

  def lower_negative_rankings_by_same_user
    negative_rankings_by_same_user.where(:position.lt(position))
  end

  def majorities_where_ranked_answer_is_winner
    Majority.where(:winner_id => answer_id)
  end

  def majorities_where_ranked_answer_is_loser
    Majority.where(:loser_id => answer_id)
  end

  def all_rankings_for_same_answer
    Ranking.where(:answer_id => answer_id)
  end

  def all_answers_in_question
    Answer.where(:question_id => question_id)
  end

  def answers_not_ranked_by_same_user
    all_answers_in_question.
      left_join(rankings_by_same_user).
      where(Ranking[:id] => nil).
      project(Answer)
  end
end