require 'spec_helper'

describe SandboxController do
  attr_reader :organization, :other_organization, :election, :user

  before do
    @organization = Organization.make(:privacy => 'public')
    @other_organization = Organization.make(:privacy => 'private')
    @user = login_as organization.make_member
    @election = organization.elections.make(:creator => user)
  end

  describe "#fetch" do
    it "calls #fetch on the sandbox object with the given relations, parsed from json and returns the result as json" do
      get :fetch, :relations => [Election.wire_representation].to_json
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
      it "returns '403 forbidden'" do
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

    context "when creating in a non-existent relation" do
      it "returns a 404 not found" do
        post :create, :relation => "junk"
        response.should be_not_found
      end
    end
  end

  describe "#update" do
    describe "when performing a legal update" do
      it "updates the record and returns its new wire representation" do
        put :update, :relation => "elections", :id => election.to_param, :field_values => { :body => "New body" }
        response.should be_success
        json = JSON.parse(response.body)
        json.should == election.wire_representation
        election.body.should == "New body"
      end
    end

    describe "when performing an invalid update" do
      it "returns '422 unprocessable entity'" do
        put :update, :relation => "users", :id => user.to_param, :field_values => { :first_name => "" }
        response.status.should == 422
      end
    end

    describe "when performing an update against a relation that does not exist" do
      it "returns '404 not found'" do
        put :update, :relation => "junk", :id => '1', :field_values => { :body => "New body" }
        response.status.should == 404
      end
    end

    describe "when performing an update against a record that is not in the relation" do
      it "returns '404 not found'" do
        put :update, :relation => "elections", :id => '909', :field_values => { :body => "New body" }
        response.status.should == 404
      end
    end
  end

  describe "#destroy" do
    describe "when destroying a record that exists" do
      it "destroys the record and returns 200 ok" do
        delete :destroy, :relation => "elections", :id => election.to_param
        response.should be_success
        Election.find(election.id).should be_nil
      end
    end

    describe "when destroying a record that doesn't exist" do
      it "returns '404 not found'" do
        delete :destroy, :relation => "elections", :id => '909'
        response.status.should == 404
      end
    end

    describe "when the specified relation does not exist" do
      it "returns '404 not found'" do
        delete :destroy, :relation => "junk", :id => '909'
        response.status.should == 404
      end
    end
  end
end
