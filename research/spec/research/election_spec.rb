require File.expand_path(File.dirname(__FILE__)) + '/../spec_helper.rb'


describe Election do
  attr_accessor :election, :majorities, :num_candidates, :num_rankings, :num_ranked
  
  before do
    @num_candidates = 10
    @num_rankings   = 50
    @num_ranked     = 10
    
    # add random rankings
    @election = Election.new
    num_candidates.times {election.add_candidate}
    unranked_id = Ranking::UNRANKED_ID
    num_rankings.times do
      random_ranking = Ranking.new(
                        ((election.candidate_ids.sort_by {rand}).
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
  
  it "results reproduce a single ranking with no ties" do
    trivial_election = Election.new
    num_candidates.times {trivial_election.add_candidate}
    random_ranking = Ranking.new( trivial_election.candidate_ids.sort_by {rand} )
    trivial_election.add_ranking(random_ranking)    
    trivial_election.results.inspect.should == random_ranking.inspect
    #puts " results: #{election.results.inspect}"
  end
  
  it "results reproduce a single ranking with ties" do
    trivial_election = Election.new
    num_candidates.times {trivial_election.add_candidate}
    random_ranking = Ranking.new((trivial_election.candidate_ids.sort_by {rand}).first(num_ranked))
    trivial_election.add_ranking(random_ranking)    
    trivial_election.results.inspect.should == random_ranking.inspect
    #puts " results: #{election.results.inspect}"
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
  
end



# module Models
#   describe Election do
#     attr_reader :election, :memphis, :knoxville, :chattanooga, :nashville, :unranked
# 
#     before do
#       @election = Election.make(:body => "Where should the capital of Tennesee be?")
#       @memphis = election.candidates.create!(:body => "Memphis")
#       @knoxville = election.candidates.create!(:body => "Knoxville")
#       @chattanooga = election.candidates.create!(:body => "Chattanooga")
#       @nashville = election.candidates.create!(:body => "Nashville")
#       @unranked = election.candidates.create!(:body => "Unranked")
#     end
# 
#     describe "#compute_global_ranking" do
#       it "uses the ranked-pairs algoritm to produce a global ranking, assigning a position of null to any unranked candidates" do
#         4.times do
#           user = User.make
#           election.rankings.create(:user => user, :candidate => memphis, :position => 1)
#           election.rankings.create(:user => user, :candidate => nashville, :position => 2)
#           election.rankings.create(:user => user, :candidate => chattanooga, :position => 3)
#           election.rankings.create(:user => user, :candidate => knoxville, :position => 4)
#         end
# 
#         3.times do
#           user = User.make
#           election.rankings.create(:user => user, :candidate => nashville, :position => 1)
#           election.rankings.create(:user => user, :candidate => chattanooga, :position => 2)
#           election.rankings.create(:user => user, :candidate => knoxville, :position => 3)
#           election.rankings.create(:user => user, :candidate => memphis, :position => 4)
#         end
# 
#         1.times do
#           user = User.make
#           election.rankings.create(:user => user, :candidate => chattanooga, :position => 1)
#           election.rankings.create(:user => user, :candidate => knoxville, :position => 2)
#           election.rankings.create(:user => user, :candidate => nashville, :position => 3)
#           election.rankings.create(:user => user, :candidate => memphis, :position => 4)
#         end
# 
#         2.times do
#           user = User.make
#           election.rankings.create(:user => user, :candidate => knoxville, :position => 1)
#           election.rankings.create(:user => user, :candidate => chattanooga, :position => 2)
#           election.rankings.create(:user => user, :candidate => nashville, :position => 3)
#           election.rankings.create(:user => user, :candidate => memphis, :position => 4)
#         end
# 
#         election.compute_global_ranking
# 
#         nashville.reload.position.should == 1
#         chattanooga.position.should == 2
#         knoxville.position.should == 3
#         memphis.position.should == 4
#         unranked.reload.position.should be_nil
#       end
#     end
#   end
# end
