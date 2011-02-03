require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "GET /app", :type => :rack do
  context "if the user is not authenticated" do
    it "authenticates them as a guest" do
      get "/app"
      last_response.should be_ok
      current_user.should be_guest
    end
  end
  
  context "if the user is authenticated" do
    it "responds successfully" do

    end
  end
end
