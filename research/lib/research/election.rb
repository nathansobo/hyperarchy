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
    
    # for each majority, add an edge to the graph, unless the opposing
    #  majority is larger and has already been added
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
    graph = RGL::DirectedAdjacencyGraph.new
    tied_sets = []
    @majorities = (@majorities.sort_by {|m| m[:count]}).reverse
    @majorities.each do |majority|
      winner = majority[:winner]
      loser  = majority[:loser]
      count  = majority[:count]
      
      # for each majority, add an edge to the graph, unless the opposing
      #  majority is larger and has already been added
      opposing_count = @majorities.find {|m| m[:winner] == loser and m[:loser] == winner}[:count]
      next  if opposing_count > count
      graph.add_edge(winner, loser)
      
      # if the new edge creates a cycle, check if all of the majorities
      #  involved are the same size. otherwise, remove this edge.
      (tied_sets << [winner, loser].sort!; next)  if opposing_count == count
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
        cycles.each {|cycle| tied_sets << cycle.sort!}  if tied
        graph.remove_edge(winner, loser)                if not tied
      end
    end
        
    # combine all of the intersecting tied sets and remove redundancies
    unless tied_sets.empty?
      tied_sets.uniq!
      tied_candidates = tied_sets.flatten.uniq
      tied_candidates.each do |candidate|
        first_cycle = tied_sets.find {|cycle| cycle.include? candidate}
        position    = tied_sets.index first_cycle
        if other_cycles = (tied_sets - [first_cycle]).find_all {|cycle| cycle.include? candidate}
          other_cycles.each {|other_cycle| tied_sets[position] |= other_cycle}
          other_cycles.each {|other_cycle| tied_sets.delete other_cycle}
        end
      end
    end
           
    # for each set of tied candidates, temporarily remove all but one candidate from the graph.
    #  perform the topsort, then put the tied sets back into the final result
    @results = []
    tied_sets.each {|set| set[1...set.size].each {|v| graph.remove_vertex v}}
    graph.topsort_iterator.each {|candidate_id| @results << candidate_id}
    tied_sets.each {|set| @results[@results.index(set[0])] = set.sort!}
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
