require File.expand_path(File.dirname(__FILE__)) + '/../spec_helper.rb'


describe Election do
  attr_accessor :election
  
  before do
    @election = Election.new
  end

  it "initializes, keeps track of election ids" do
    election.body.should == "Question 0"
    election.id.should == 0
    Election[0].should == election
    
    election1 = Election.new("What the heck?")
    election1.body.should == "What the heck?"  
    election1.id.should == 1
    Election[1].should == election1
  end
    
  it "accepts rankings, computes results" do
    n = 5
    n.times {election.add_candidate}
    election.candidates.length.should == n    
    
    election.add_ranking([0,"others"])
    election.add_ranking([1,0,"others",2])
    
    results = election.results
    results.first.should == 0
    results.last.should == 2
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
