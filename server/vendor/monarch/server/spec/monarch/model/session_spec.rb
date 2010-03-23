require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

describe Session do
  describe "#before_create" do
    it "sets :session_id to a guid" do
      session = Session.create!
      session.session_id.should be_an_instance_of(String)
    end
  end
end
