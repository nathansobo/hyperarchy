require 'spec_helper'

describe SandboxController do
  attr_reader :election

  before do
    organization = Organization.make(:privacy => 'public')
    @election = organization.elections.make
    login_as make_member(organization)
  end

  describe "#fetch" do
    it "calls #fetch on the associated sandbox object with the given relations, parsed from json" do
      get :fetch, :relations => Election.wire_representation.to_json
      JSON.parse(response.body)['elections'][election.to_param].should == election.wire_representation
    end
  end
end
