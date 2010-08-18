require File.expand_path(File.dirname(__FILE__)) + '/../spec_helper.rb'


describe Election do
  attr_accessor :election, :majorities, :num_candidates, :num_rankings, :num_ranked
  
  before do
    @num_candidates = 10
    @num_rankings   = 30
    @num_ranked     = 5
    
    # add random rankings
    @election = Election.new
    num_candidates.times {election.add_candidate}
    unranked_id = Ranking::UNRANKED_ID
    num_rankings.times do
      random_ranking = Ranking.new(
                        (election.candidate_ids.sort_by {rand}.
                        first(num_ranked) + [unranked_id]).sort_by{rand})
      election.add_ranking(random_ranking)
    end
    
    # count pairwise majorities
    @majorities = Array.new(num_candidates) {Array.new(num_candidates) {0}}
    election.rankings.each do |ranking|
      election.candidate_ids.each do |winner|
        ranking.candidates_below(winner).each {|loser| majorities[winner][loser] += 1}
      end
    end
  end
  
  it "reproduces a single ranking with no ties" do
    trivial_election = Election.new
    num_candidates.times {trivial_election.add_candidate}
    random_ranking = Ranking.new( trivial_election.candidate_ids.sort_by {rand} )
    trivial_election.add_ranking(random_ranking)    
    #puts " ranking: #{random_ranking.inspect}"
    puts " results: #{trivial_election.results.inspect}"
    random_ranking.should == trivial_election.results
  end
  
  it "reproduces a single ranking with ties" do
    trivial_election = Election.new
    num_candidates.times {trivial_election.add_candidate}
    random_ranking = Ranking.new(
                      (election.candidate_ids.sort_by {rand}.
                      first(num_ranked) + [Ranking::UNRANKED_ID]).sort_by{rand})
    trivial_election.add_ranking(random_ranking)    
    #puts " ranking: #{random_ranking.inspect}"
    puts " results: #{trivial_election.results.inspect}"
    random_ranking.should == trivial_election.results
  end
    
  it "ranks condorcet winner first, if there is one" do
    election.candidate_ids.each do |candidate|
      other_candidates = election.candidate_ids - [candidate]
      if other_candidates.all? {|other| majorities[candidate][other] > majorities[other][candidate]}
        #puts " condorcet winner: #{candidate}"
        election.results.first.should == candidate
        break
      end
    end
    puts " results: #{election.results.inspect}"
  end
  
  it "ranks condorcet loser last, if there is one" do
    election.candidate_ids.each do |candidate|
      other_candidates = election.candidate_ids - [candidate]
      if other_candidates.all? {|other| majorities[candidate][other] < majorities[other][candidate]}
        #puts " condorcet loser: #{candidate}"
        election.results.last.should == candidate
        break
      end
    end
    puts " results: #{election.results.inspect}"
  end
  
  it "satisfies strong-pareto efficiency" do
    election.candidate_ids.each do |candidate|
      other_candidates = election.candidate_ids - [candidate]
      other_candidates.each do |other| 
        if majorities[candidate][other] == 0 and majorities[other][candidate] > 0
          election.results.index(candidate).should <= election.results.index(other)
        end
      end
    end
  end
  
  it "recognizes multi-candidate cycles" do
    cycle_election = Election.new
    4.times {cycle_election.add_candidate}
    cycle_election.add_ranking([0,1,2,3])
    cycle_election.add_ranking([1,2,3,0])
    cycle_election.add_ranking([2,3,0,1])
    cycle_election.add_ranking([3,0,1,2])
    cycle_election.results.should == [[0, 1, 2, 3]]
    cycle_election.add_candidate
    cycle_election.results.should == [[0, 1, 2, 3], 4]
    #puts " results: #{cycle_election.results.inspect}"
  end
end
