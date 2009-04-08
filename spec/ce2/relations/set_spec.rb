require File.expand_path("#{File.dirname(__FILE__)}/../ce2_spec_helper")

module Relations
  describe Set do

    before do
      @set = Answer.set
    end

    describe "#define_attribute" do
      it "adds an Attribute with the given name and type and self as its #set to the #attributes_by_name hash" do
        attribute = set.attributes_by_name["body"]
        attribute.name.should == :body
        attribute.type.should == :string
      end
    end

    describe "#insert" do
      it "executes an insert statement against the database for the given Tuple" do
        attributes = { :name => "Nathan", :age => 26 }
        user = User.new(attributes)

        mock(Origin).insert(:users, attributes)
        set.insert(user)
      end
    end

    describe "#tuples" do
      it "executes a select all SQL query against the database and returns Tuples corresponding to its result"
    end


  end
end