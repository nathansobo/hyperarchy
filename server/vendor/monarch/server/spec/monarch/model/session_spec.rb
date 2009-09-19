require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

describe Session do
  describe "#before_create" do
    it "sets :session_id to :id" do
      session = Session.create
      session.session_id.should == session.id
    end
  end
end
