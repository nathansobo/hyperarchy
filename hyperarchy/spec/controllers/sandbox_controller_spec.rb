require 'spec_helper'

describe SandboxController do
  attr_reader :organization, :other_organization, :election

  before do
    @organization = Organization.make(:privacy => 'public')
    @other_organization = Organization.make(:privacy => 'private')
    @election = organization.elections.make
    login_as make_member(organization)
  end

  describe "#fetch" do
    it "calls #fetch on the sandbox object with the given relations, parsed from json and returns the result as json" do
      get :fetch, :relations => Election.wire_representation.to_json
      JSON.parse(response.body)['elections'][election.to_param].should == election.wire_representation
    end
  end

  describe "#create" do
    context "when creating a legal record" do
      it "creates the record and returns its wire representation" do
        Election.count.should == 1
        post :create, :relation => "elections", :field_values => Election.plan(:organization => organization)
        response.should be_success
        Election.count.should == 2
        json = JSON.parse(response.body)
        json.should == Election.find(json['id']).wire_representation
      end
    end

    context "when creating an illegal record" do
      it "returns an error" do
        Election.count.should == 1
        post :create, :relation => "elections", :field_values => Election.plan(:organization => other_organization)
        Election.count.should == 1
        response.should be_forbidden
      end
    end

    context "when creating an invalid record" do
      it "returns validation errors" do
        post :create, :relation => "users", :field_values => {}
        response.status.should == 422 # unprocessable entity
        json = JSON.parse(response.body)
        json['first_name'].should_not be_empty
        json['last_name'].should_not be_empty
        json['email_address'].should_not be_empty
        json['password'].should_not be_empty
      end
    end
  end
end
