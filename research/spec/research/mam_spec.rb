require File.expand_path("#{File.dirname(__FILE__)}/../spec_helper")

describe Mam do
  attr_reader :mam

  before do
    @mam = Mam.new
  end

  it "deals well with tie scenarios" do

    mam.add_ranking([1, 2, 3, 4])
    mam.add_ranking([1, 4, 2, 3])
    # ... more rankings here, maybe looping to add them or whatever

    mam.results.should == [1, [4, 3], 1]
    # 4 and 3 are tied? you can come up with whatever representation
  end
end