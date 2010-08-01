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
  
  # reference a particular election by its ID number
  class << self
    def [](id)
      @@all_elections[id]
    end
  end
  
  def candidate_ids
    return (0...@candidates.length).to_a
  end
  
  def num_candidates
    return @candidates.length
  end
  
  def add_candidate(candidate="Candidate #{@candidates.length}")
    @candidates.push(candidate)
    @results_current = false
    new_id = @candidates.length - 1
    
    # add new pairwise majorities for this new candidate
    candidate_ids[0...new_id].each do |id|
      @majorities << {:winner => new_id, :loser => id, :count => 0}
      @majorities << {:winner => id, :loser => new_id, :count => 0}
    end
    
    # look at all of the existing rankings. 
    @rankings.each do |ranking|
      ranking.candidates_above_default.each do |w|
        @majorities.each {|m| m[:count] += 1  if m[:winner] == w and m[:loser] == new_id}
      end
      ranking.candidates_below_default.each do |l|
        @majorities.each {|m| m[:count] += 1  if m[:loser] == l and m[:winner] == new_id}
      end
    end
  end
  
  # add a new user ranking, specified by the array "new_ranking." this is converted to a "Ranking" object.
  def add_ranking(the_ranking)
    ranking = Ranking.new(id, the_ranking)
    @rankings.push(ranking)
    @results_current = false
    
    # increment the count for each pairwise majority in the new ranking
    candidate_ids.each do |w|
      ranking.candidates_below(w).each do |l| 
        @majorities.each {|m| m[:count] += 1  if m[:winner] == w and m[:loser] == l}
      end
    end  
  end
  
  # returns current global ranking.
  def results
    compute_results unless @results_current
    return @results
  end 
  
  private
  
  # this is the MAM algorithm. to use another Condorcet method, redefine this method.
  def compute_results
    already_processed = []
    graph = RGL::DirectedAdjacencyGraph.new    
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
    graph.topsort_iterator.each {|candidate_id|  @results << candidate_id}
    @results_current = true
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

