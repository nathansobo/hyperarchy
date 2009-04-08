require File.expand_path("#{File.dirname(__FILE__)}/ce2_spec_helper")

describe Repository do
  describe "#insert" do
    it "performs an insert against the database for the given table name and attributes" do
      id = Guid.new.to_s

      dataset = Origin.connection[:answers]
      dataset[:id => id].should be_nil

      record = {:id => id, :body => "Bulgar Wheat", :correct => true }
      Origin.insert("answers", record)
      
      retrieved_record = dataset[:id => id]
      retrieved_record[:id].should == record[:id]
      retrieved_record[:body].should == record[:body]
      retrieved_record[:correct].should == record[:correct]
    end
  end
end