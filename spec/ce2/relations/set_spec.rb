require File.expand_path("#{File.dirname(__FILE__)}/../ce2_spec_helper")

module Relations
  describe Set do

    attr_reader :set
    before do
      @set = Answer.set
    end

    describe "#define_attribute" do
      it "adds an Attribute with the given name and type and self as its #set to the #attributes_by_name hash" do
        attribute = set.attributes_by_name[:body]
        attribute.name.should == :body
        attribute.type.should == :string
      end
    end

    describe "#attributes" do
      it "returns the #values of #attributes_by_name" do
        set.attributes.should == set.attributes_by_name.values
      end
    end

    describe "#insert" do
      it "calls Origin.insert with the Set's #global_name and #field_values_by_attribute_name" do
        tuple = Answer.new(:body => "Brown Rice", :correct => true)
        mock(Origin).insert(set.global_name, tuple.field_values_by_attribute_name)
        set.insert(tuple)
      end
    end

    describe "#tuples" do
      it "executes a select all SQL query against the database and returns Tuples corresponding to its result"
    end
  end
end