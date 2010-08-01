require File.expand_path(File.dirname(__FILE__)) + '/../spec_helper.rb'


describe Election do
  attr_accessor :election, :num_candidates, :num_users, :num_ranked, :unranked_id
  
  before do
    @num_candidates  = 10
    @num_users       = 5   
    @num_ranked      = 5
    
    @unranked_id = Ranking::UNRANKED_ID
    @election = Election.new
    num_candidates.times {election.add_candidate}
    num_users.times do
      random_ranking = (election.candidate_ids.sort_by {rand}).first(num_ranked)
      random_ranking = (random_ranking + [unranked_id]).sort_by {rand}
      election.add_ranking(random_ranking)
      #puts random_ranking.inspect
    end
  end

  it "initializes, keeps track of election IDs" do
    election.id.should == 0
    Election[0].should == election    
    election1 = Election.new
    election1.id.should == 1
    Election[1].should == election1
  end
  
  it "elects the condorcet winner, if one exists" do
    majorities = Array.new(num_candidates, 0)
    majorities.each_index {|i| majorities[i] = Array.new(num_candidates, 0)}
    election.candidate_ids.each do |winner|
      election.rankings.each do |ranking|
        ranking.candidates_below(winner).each {|loser| majorities[winner][loser] += 1}
      end
    end
    condorcet_winner = nil
    election.candidate_ids.each do |i|
      other_candidates = election.candidate_ids - [i]
      if other_candidates.all? {|j| majorities[i][j] > majorities[j][i]}
        puts "- condorcet winner is " + i.to_s
        condorcet_winner = i
      end
    end
    
    if condorcet_winner
      election.results.first.should == condorcet_winner
    end
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
