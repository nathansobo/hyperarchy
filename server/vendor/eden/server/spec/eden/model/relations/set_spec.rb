require File.expand_path("#{File.dirname(__FILE__)}/../../../eden_spec_helper")

module Model
  module Relations
    describe Set do

      attr_reader :set
      before do
        @set = Candidate.set
      end

      describe "#initialize" do
        it "automatically has a string-valued :id column" do
          set.columns_by_name[:id].type.should == :string
        end
      end

      describe "#define_column" do
        it "adds a Column with the given name and type and self as its #set to the #columns_by_name hash" do
          column = set.columns_by_name[:body]
          column.name.should == :body
          column.type.should == :string
        end
      end

      describe "#columns" do
        it "returns the #values of #columns_by_name" do
          set.columns.should == set.columns_by_name.values
        end
      end

      describe "#insert" do
        it "calls Origin.insert with the Set and #field_values_by_column_name" do
          tuple = Candidate.new(:body => "Brown Rice", :election_id => "grain")
          mock(Origin).insert(set, tuple.field_values_by_column_name)
          set.insert(tuple)
        end
      end

      describe "#create" do
        it "instantiates an instance of #tuple_class with the given columns, #inserts it, and returns it" do
          mock(set).insert(anything) do |tuple|
            tuple.class.should == set.tuple_class
            tuple.body.should == "Brown Rice"
            tuple.election_id.should == "grain"
          end

          tuple = set.create(:body => "Brown Rice", :election_id => "grain")
          tuple.body.should == "Brown Rice"
        end
      end

      describe "#tuples" do
        it "executes a select all SQL query against the database and returns Tuples corresponding to its results" do
          tuple_1_id = set.create(:body => "Quinoa", :election_id => "grain").id
          tuple_2_id = set.create(:body => "White Rice", :election_id => "grain").id
          tuple_3_id = set.create(:body => "Pearled Barley", :election_id => "grain").id

          mock.proxy(Origin).read(set, "select candidates.id, candidates.body, candidates.election_id from candidates;")

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
        it "returns a select statement for only the columns declared as Columns on the Set" do
          columns = set.columns.map {|a| a.to_sql }.join(", ")
          set.to_sql.should == "select #{columns} from #{set.global_name};"
        end
      end

      describe "#locate" do
        it "returns the Tuple with the given :id" do
          Candidate.set.locate("quinoa").should == Candidate.set.find("quinoa")
        end
      end

      describe "#initialize_identity_map" do
        after do
          # verify doubles before the global after clears the identity map, causing an unexpected invocation
          RR::verify_doubles
        end

        it "initializes a thread-local identity map" do
          mock(Thread.current)['candidates_identity_map'] = {};
          Candidate.set.initialize_identity_map
        end
      end

      describe "#identity_map" do
        it "returns the thread-local identity map" do
          mock(Thread.current)['candidates_identity_map']
          Candidate.set.identity_map
        end
      end

      describe "#clear_identity_map" do
        after do
          # verify doubles before the global after clears the identity map, causing an unexpected invocation
          RR::verify_doubles
        end
        
        it "assigns the thread-local identity map to nil" do
          mock(Thread.current)['candidates_identity_map'] = nil;
          Candidate.set.clear_identity_map
        end
      end
    end
  end
end
