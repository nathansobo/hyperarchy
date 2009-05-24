require File.expand_path("#{File.dirname(__FILE__)}/../../../hyperarchy_spec_helper")

module Model
  module Relations
    describe Set do

      attr_reader :set
      before do
        @set = Candidate.set
      end

      describe "#initialize" do
        it "automatically has a string-valued :id attribute" do
          set.attributes_by_name[:id].type.should == :string
        end
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
          tuple = Candidate.new(:body => "Brown Rice", :election_id => "grain")
          mock(Origin).insert(set.global_name, tuple.field_values_by_attribute_name)
          set.insert(tuple)
        end
      end

      describe "#create" do
        it "instantiates an instance of #tuple_class with the given attributes, #inserts it, and returns it" do
          mock(set).insert(anything) do |tuple|
            tuple.class.should == set.tuple_class
            tuple.body.should == "Brown Rice"
            tuple.election_id.should == "grain"
          end

          tuple = set.create(:body => "Brown Rice", :election_id => "grain")
          tuple.body.should == "Brown Rice"
        end
      end

      describe "#find" do
        it "returns the first Tuple in a Selection where id is equal to the given id" do
          Candidate.set.find("grain_quinoa").should == Candidate.set.where(Candidate.id.eq("grain_quinoa")).tuples.first
        end
      end

      describe "#tuples" do
        it "executes a select all SQL query against the database and returns Tuples corresponding to its results" do
          tuple_1_id = set.create(:body => "Quinoa", :election_id => "grain").id
          tuple_2_id = set.create(:body => "White Rice", :election_id => "grain").id
          tuple_3_id = set.create(:body => "Pearled Barley", :election_id => "grain").id

          mock.proxy(Origin).read(set.tuple_class, "select candidates.id, candidates.body, candidates.election_id from candidates;")

          tuples = set.tuples

          retrieved_tuple_1 = tuples.find {|t| t.id == tuple_1_id }
          retrieved_tuple_1.body.should == "Quinoa"
          retrieved_tuple_1.election_id.should == "grain"

          retrieved_tuple_2 = tuples.find {|t| t.id == tuple_2_id }
          retrieved_tuple_2.body.should == "White Rice"
          retrieved_tuple_2.election_id.should == "grain"

          retrieved_tuple_3 = tuples.find {|t| t.id == tuple_3_id }
          retrieved_tuple_3.body.should == "Pearled Barley"
          retrieved_tuple_3.election_id.should == "grain"
        end
      end

      describe "#to_sql" do
        it "returns a select statement for only the columns declared as Attributes on the Set" do
          columns = set.attributes.map {|a| a.to_sql }.join(", ")
          set.to_sql.should == "select #{columns} from #{set.global_name};"
        end
      end

      describe "#locate" do
        it "returns the Tuple with the given :id" do
          Candidate.set.locate("quinoa").should == Candidate.set.find("quinoa")
        end
      end
    end
  end
end