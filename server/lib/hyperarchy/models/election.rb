
class Election < Model::Record
  column :organization_id, :key
  column :body, :string

  has_many :candidates
  has_many :rankings
  has_many :majorities

  def compute_global_ranking
    puts "compute_global_ranking"
    already_processed = []
    graph = RGL::DirectedAdjacencyGraph.new

    majorities.order_by(Majority[:count].desc).each do |majority|
      winner_id = majority.winner_id
      loser_id = majority.loser_id
      next if already_processed.include?([loser_id, winner_id])
      already_processed.push([winner_id, loser_id])
      graph.add_edge(winner_id, loser_id)
      graph.remove_edge(winner_id, loser_id) unless graph.acyclic?
    end

    graph.topsort_iterator.each_with_index do |candidate_id, index|
      candidate = Candidate.find(candidate_id)
      puts "updating #{candidate.body.inspect} from #{candidate.position} #{index}"
      candidate.update(:position => index + 1)
    end
  end
end
