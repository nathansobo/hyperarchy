require 'spec_helper'

describe UsersController do
  describe "#new" do
    it "assigns an empty user" do
      get :new
      response.should be_success
      assigns[:user].should_not be_nil
    end
  end

  describe "#create" do
    context "for a normal request" do
      context "when the params are valid" do
        it "creates the user, logs them in, and redirects " do
          
        end
      end
      
      context "when the params are invalid" do
        
      end
    end

    context "for an XHR request" do

    end
  end
end
