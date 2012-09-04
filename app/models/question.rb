class Question < Prequel::Record
  column :id, :integer
  column :organization_id, :integer
  column :creator_id, :integer
  column :body, :string
  column :details, :string
  column :vote_count, :integer, :default => 0
  column :score, :float
  column :created_at, :datetime
  column :updated_at, :datetime

  has_many :answers
  has_many :votes
  has_many :rankings
  has_many :majorities

  belongs_to :creator, :class_name => "User"

  def can_update_or_destroy?
    creator_id == current_user.id
  end
  alias can_update? can_update_or_destroy?
  alias can_destroy? can_update_or_destroy?

  def create_whitelist
    [:body, :details]
  end

  def update_whitelist
    [:body, :details]
  end

  def before_create
    ensure_body_within_limit
    self.creator ||= current_user
  end

  def ensure_body_within_limit
    raise SecurityError, "Body exceeds 140 characters" if body.length > 140
  end

  def before_update(changeset)
    ensure_body_within_limit if changeset[:body]
  end

  def before_destroy
    answers.each(&:destroy)
  end

  def compute_global_ranking
    already_processed = []
    graph = RGL::DirectedAdjacencyGraph.new

    majorities.order_by(Majority[:pro_count].desc, Majority[:con_count].asc, Majority[:winner_created_at].asc).each do |majority|
      winner_id = majority.winner_id
      loser_id = majority.loser_id
      next if already_processed.include?([loser_id, winner_id])
      already_processed.push([winner_id, loser_id])
      graph.add_edge(winner_id, loser_id)
      graph.remove_edge(winner_id, loser_id) unless graph.acyclic?
    end

    graph.topsort_iterator.each_with_index do |answer_id, index|
      answer = answers.find(answer_id)
      answer.update!(:position => index + 1)
    end

    update!(:updated_at => Time.now)
  end

  def positive_rankings
    rankings.where(Ranking[:position].gt(0))
  end

  def negative_rankings
    rankings.where(Ranking[:position].lt(0))
  end

  def positive_answer_ranking_counts
    times_each_answer_is_ranked(positive_rankings)
  end

  def negative_answer_ranking_counts
    times_each_answer_is_ranked(negative_rankings)
  end

  def times_each_answer_is_ranked(relation)
    relation.
      group_by(:answer_id).
      project(:answer_id, Ranking[:id].count.as(:times_ranked))
  end

  def ranked_answers
    answers.
      join(rankings).
      project(Answer)
  end
end
