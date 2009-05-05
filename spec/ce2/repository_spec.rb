require File.expand_path("#{File.dirname(__FILE__)}/hyperarchy_spec_helper")

describe Repository do
  describe "#insert" do
    it "performs an insert against the database for the given table name and attributes" do
      id = Guid.new.to_s

      dataset = Origin.connection[:candidates]
      dataset[:id => id].should be_nil

      record = {:id => id, :body => "Bulgar Wheat", :election_id => "grain" }
      Origin.insert("candidates", record)
      
      retrieved_record = dataset[:id => id]
      retrieved_record[:id].should == record[:id]
      retrieved_record[:body].should == record[:body]
      retrieved_record[:election_id].should == record[:election_id]
    end
  end

  describe "#read" do
    it "instantiates instances of the given class with the attributes of every record returned by the given query" do
      Origin.connection[:candidates] << { :id => "1", :body => "Quinoa" }
      Origin.connection[:candidates] << { :id => "2", :body => "Barley" }

      tuples = Origin.read(Candidate, "select id, body from candidates;")

      tuple_1 = tuples.find {|t| t.id == "1"}
      tuple_1.body.should == "Quinoa"

      tuple_2 = tuples.find {|t| t.id == "2"}
      tuple_2.body.should == "Barley"
    end
  end
end