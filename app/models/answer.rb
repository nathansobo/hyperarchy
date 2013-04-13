class Answer < Prequel::Record
  column :id, :integer
  column :body, :string
  column :question_id, :integer
  column :creator_id, :integer
  column :position, :integer
  column :created_at, :datetime
  column :updated_at, :datetime

  belongs_to :question
  belongs_to :creator, :class_name => "User"
  has_many :preferences

  delegate :broadcast_channels, :to => :question

  def can_create?
    !question.archived?
  end

  def can_update_or_destroy?
    if question.archived?
      false
    else
      creator_id == current_user.id
    end
  end
  alias can_update? can_update_or_destroy?
  alias can_destroy? can_update_or_destroy?

  def create_whitelist
    [:body, :question_id]
  end

  def update_whitelist
    [:body]
  end

  def before_create
    ensure_body_within_limit
    question.lock
    self.creator ||= current_user
  end

  def before_update(changeset)
    ensure_body_within_limit if changeset[:body]
  end

  def ensure_body_within_limit
    raise SecurityError, "Body exceeds 140 characters" if body.length > 140
  end

  def after_create
    update(:position => 1) if other_answers.empty?
    other_answers.each do |other_answer|
      Majority.create({:winner => self, :loser => other_answer, :question_id => question_id})
      Majority.create({:winner => other_answer, :loser => self, :question_id => question_id})
    end

    victories_over(question.negative_answer_preference_counts).update(:pro_count => :times_ranked)
    victories_over(question.positive_answer_preference_counts).update(:con_count => :times_ranked)
    defeats_by(question.positive_answer_preference_counts).update(:pro_count => :times_ranked)
    defeats_by(question.negative_answer_preference_counts).update(:con_count => :times_ranked)

    question.compute_global_ranking
    question.unlock
  end

  def before_destroy
    question.lock
    preferences.each do |preference|
      preference.suppress_ranking_update = true
      preference.destroy
    end
    winning_majorities.each(&:destroy)
    losing_majorities.each(&:destroy)
  end

  def after_destroy
    question.unlock
  end

  def other_answers
    question.answers.where(Answer[:id].neq(id))
  end

  def victories_over(other_answer_preference_counts)
    winning_majorities.
      join(other_answer_preference_counts, :loser_id => :answer_id)
  end

  def defeats_by(other_answer_preference_counts)
    losing_majorities.
      join(other_answer_preference_counts, :winner_id => :answer_id)
  end

  def winning_majorities
    question.majorities.where(:winner_id => id)
  end

  def losing_majorities
    question.majorities.where(:loser_id => id)
  end

  def extra_records_for_create_events
    [creator]
  end
end
