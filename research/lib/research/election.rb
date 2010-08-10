class Election
  attr_reader :body, :id, :candidates, :majorities, :rankings  
  @@all_elections = []
  
  def initialize(body = "Question #{@@all_elections.length}")
    @id = @@all_elections.length
    @@all_elections.push(self)    
    @body       = body
    @rankings   = []
    @candidates = []
    @majorities = []
    @results    = []
    @results_current = true
  end
  
  def candidate_ids
    return (0...@candidates.length).to_a
  end
  
  def num_candidates
    return @candidates.length
  end
  
  def num_rankings
    return @rankings.length
  end
  
  def add_candidate(candidate="Candidate #{@candidates.length}")
    @candidates.push(candidate)
    @results_current = false
    new_id = @candidates.length - 1
    
    candidate_ids[0...new_id].each do |id|
      @majorities << {:winner => new_id, :loser => id, :count => 0}
      @majorities << {:winner => id, :loser => new_id, :count => 0}
    end
    @rankings.each do |ranking|
      ranking.candidates_above_default.each do |w|
        @majorities.find {|m| m[:winner] == w and m[:loser] == new_id}[:count] += 1
      end
      ranking.candidates_below_default.each do |l|
        @majorities.find {|m| m[:loser] == l and m[:winner] == new_id}[:count] += 1
      end
    end
  end
  
  def add_ranking(ranking)    
    ranking = Ranking.new(ranking)  if ranking.class != Ranking
    ranking.election = self
    @rankings.push(ranking)
    @results_current = false
    candidate_ids.each do |winner|
      ranking.candidates_below(winner).each do |loser| 
        @majorities.find {|m| m[:winner] == winner and m[:loser] == loser}[:count] += 1
      end
    end
  end
  
  def results
    compute_results unless @results_current
    return @results
  end 
  
  private
  
  def compute_results
    #ranked_pairs
    ranked_pairs_with_ties
    #minimax
    #schulze
    @results_current = true
  end
  
  def ranked_pairs
    graph = RGL::DirectedAdjacencyGraph.new
    already_processed = []
    @majorities = (@majorities.sort_by {|m| m[:count]}).reverse
    @majorities.each do |majority|
      winner_id = majority[:winner]
      loser_id = majority[:loser]
      next if already_processed.include?([loser_id, winner_id])
      already_processed.push([winner_id, loser_id])
      graph.add_edge(winner_id, loser_id)
      graph.remove_edge(winner_id, loser_id) unless graph.acyclic?
    end
    @results = []
    graph.topsort_iterator.each {|candidate_id| @results << candidate_id}
  end
  
  
  
  def ranked_pairs_with_ties
    
    # for each majority, add an edge to the graph, unless the opposing
    #  majority has already been added
    graph = RGL::DirectedAdjacencyGraph.new
    all_cycles = []
    @majorities = (@majorities.sort_by {|m| m[:count]}).reverse
    @majorities.each do |majority|
      winner = majority[:winner]
      loser  = majority[:loser]
      count  = majority[:count]
      opposing_count = @majorities.find {|m| m[:winner] == loser and m[:loser] == winner}[:count]
      next if opposing_count > count
      graph.add_edge(winner, loser)
      
      # if the new edge creates a cycle, check if all of the majorities
      #  involved are the same size. otherwise, remove this edge.
      if opposing_count == count
        all_cycles << [winner, loser].sort!
        next
      end
      if not graph.acyclic?
        tied = true
        cycles = graph.cycles_with_vertex(winner)
        cycle_edges = []
        cycles.each do |cycle|
          cycle.each_cons(2) {|pair| cycle_edges << pair}
          cycle_edges << [cycle.last, cycle.first]
        end
        cycle_edges.uniq.each do |edge|
          edge_count = @majorities.find {|m| m[:winner] == edge[0] and m[:loser] == edge[1]}[:count]
          (tied = false; break) if edge_count != count
        end
        graph.remove_edge(winner, loser)                  if not tied
        cycles.each {|cycle| all_cycles << cycle.sort!}   if tied
      end
    end
    
    # combine all of the cycles that have candidates in common to produce a
    #  list of tied sets of candidates.
    tied_sets = []
    unless all_cycles.empty?
      all_cycles.uniq!
      tied_candidates = all_cycles.flatten.uniq  
      tied_sets = all_cycles
      tied_candidates.each do |candidate|
        first_cycle = tied_sets.find {|cycle| cycle.include? candidate}
        position    = tied_sets.index first_cycle
        if other_cycles = (tied_sets - [first_cycle]).find_all {|cycle| cycle.include? candidate}
          other_cycles.each {|other_cycle| tied_sets[position] |= other_cycle}
          other_cycles.each {|other_cycle| tied_sets.delete other_cycle}
        end
      end
    end
                
    # perform the topsort, then put the tied sets back into the final result
    @results = []
    tied_sets.each {|set| set[1...set.size].each {|v| graph.remove_vertex v}}
    graph.topsort_iterator.each {|candidate_id| @results << candidate_id}
    tied_sets.each {|set| @results[@results.index(set.first)] = set.sort!}
  end
  
  
  
  def minimax
    max_losing_majorities = Array.new(num_candidates, 0)
    candidate_ids.each do |candidate|
      losing_majorities  = (@majorities.find_all {|m| m[:loser] == candidate}).collect {|m| m[:count]}
      winning_majorities = (@majorities.find_all {|m| m[:winner] == candidate}).collect {|m| m[:count]}
      losing_majorities.each_index do |i|
        losing_majorities[i] = 0  if winning_majorities[i] >= losing_majorities[i]
      end
      max_losing_majorities[candidate] = losing_majorities.max
    end
    @results = candidate_ids.sort_by {|i| max_losing_majorities[i]}
  end
  
  def schulze
    path = Array.new(num_candidates) {Array.new(num_candidates) {0}}
  end
  
  
end



# class Election < Monarch::Model::Record
#   column :organization_id, :key
#   column :body, :string
# 
#   has_many :candidates
#   has_many :rankings
#   has_many :majorities
# 
#   belongs_to :organization
# 
#   def compute_global_ranking
#     puts "compute_global_ranking"
#     already_processed = []
#     graph = RGL::DirectedAdjacencyGraph.new
# 
#     positive_majorities.order_by(Majority[:count].desc).each do |majority|
#       winner_id = majority.winner_id
#       loser_id = majority.loser_id
#       next if already_processed.include?([loser_id, winner_id])
#       already_processed.push([winner_id, loser_id])
#       graph.add_edge(winner_id, loser_id)
#       graph.remove_edge(winner_id, loser_id) unless graph.acyclic?
#     end
# 
#     graph.topsort_iterator.each_with_index do |candidate_id, index|
#       if candidate = ranked_candidates.find(candidate_id)
#         puts "updating #{candidate.body.inspect} from #{candidate.position} to #{index}"
#         candidate.update(:position => index + 1)
#       end
#     end
#   end
# 
#   def candidate_ranking_counts
#     rankings.
#       group_by(:candidate_id).
#       project(:candidate_id, Ranking[:id].count.as(:times_ranked))
#   end
# 
#   def positive_majorities
#     majorities.where(Majority[:count] > 0)
#   end
# 
#   def ranked_candidates
#     candidates.
#       join_to(rankings).
#       project(Candidate)
#   end
# end

