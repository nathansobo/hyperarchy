class Election < Monarch::Model::Record
  column :organization_id, :key
  column :creator_id, :key
  column :body, :string
  column :vote_count, :integer, :default => 0
  column :created_at, :datetime
  column :updated_at, :datetime

  has_many :candidates
  has_many :votes
  has_many :rankings
  has_many :majorities

  belongs_to :creator, :class_name => "User"
  belongs_to :organization

  def organization_ids
    [organization_id]
  end

  def before_create
    self.creator ||= current_user
  end

  def before_destroy
    candidates.each do |candidate|
      candidate.destroy
    end
  end

  def compute_global_ranking
    puts "compute_global_ranking"
    already_processed = []
    graph = RGL::DirectedAdjacencyGraph.new

    majorities.order_by(Majority[:pro_count].desc, Majority[:con_count].asc).each do |majority|
      winner_id = majority.winner_id
      loser_id = majority.loser_id
      next if already_processed.include?([loser_id, winner_id])
      already_processed.push([winner_id, loser_id])
      graph.add_edge(winner_id, loser_id)
      graph.remove_edge(winner_id, loser_id) unless graph.acyclic?
    end

    graph.topsort_iterator.each_with_index do |candidate_id, index|
      candidate = candidates.find(candidate_id)
      puts "updating #{candidate.body.inspect} from #{candidate.position} to #{index}"
      candidate.update(:position => index + 1)
    end

    update(:updated_at => Time.now)
  end

  def positive_rankings
    rankings.where(Ranking[:position] > 0)
  end

  def negative_rankings
    rankings.where(Ranking[:position] < 0)
  end

  def positive_candidate_ranking_counts
    times_each_candidate_is_ranked(positive_rankings)
  end

  def negative_candidate_ranking_counts
    times_each_candidate_is_ranked(negative_rankings)
  end

  def times_each_candidate_is_ranked(relation)
    relation.
      group_by(:candidate_id).
      project(:candidate_id, Ranking[:id].count.as(:times_ranked))
  end

  def ranked_candidates
    candidates.
      join_to(rankings).
      project(Candidate)
  end
end
