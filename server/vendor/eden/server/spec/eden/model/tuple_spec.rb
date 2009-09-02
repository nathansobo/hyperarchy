require File.expand_path("#{File.dirname(__FILE__)}/../../eden_spec_helper")

module Model
  describe Tuple do
    describe "when a subclass in created" do
      it "assigns its .set to a new Set with the underscored-pluralized name of the class as its #global_name" do
        Candidate.set.global_name.should == :candidates
      end

      it "adds its assigned .set to Domain #sets_by_name" do
        GlobalDomain.sets_by_name[:candidates].should == Candidate.set
        GlobalDomain.sets_by_name[:candidates].tuple_class.should == Candidate
      end

      it "defines an :id Column on the subclass" do
        Candidate[:id].class.should == Column
        Candidate[:id].name.should == :id
        Candidate[:id].type.should == :string
      end
    end

    describe "class methods" do
      describe ".column" do
        it "delegates column definition to .set" do
          mock(Candidate.set).define_column(:foo, :string)
          Candidate.column(:foo, :string)
        end

        it "defines named instance methods that call #set_field_value and #get_field_value" do
          tuple = Candidate.new

          mock.proxy(tuple).set_field_value(Candidate[:body], "Barley")
          tuple.body = "Barley"
          mock.proxy(tuple).get_field_value(Candidate[:body])
          tuple.body.should  == "Barley"
        end
      end

      describe ".has_many" do
        it "defines a Selection via .relates_to_many based on the given name" do
          blog = Blog.find("grain")
          candidates_relation = blog.candidates
          candidates_relation.tuples.should_not be_empty
          candidates_relation.tuples.each do |answer|
            answer.blog_id.should == blog.id
          end
        end
      end

      describe ".belongs_to" do
        it "defines a Selection via .relates_to_one based on the given name" do
          candidate = Candidate.find("grain_quinoa")
          candidate.blog.should == Blog.find("grain")
          candidate.blog_id = "vegetable"
          candidate.blog.should == Blog.find("vegetable")
        end
      end

      describe ".[]" do
        context "when the given value is the name of a Column defined on .set" do
          it "returns the Column with the given name" do
            Candidate[:body].should == Candidate.set.columns_by_name[:body]
          end
        end

        context "when the given value is not the name of a Column defined on .set" do
          it "raises an exception" do
            lambda do
              Candidate[:nonexistant_column]
            end.should raise_error
          end
        end
      end

      describe ".create" do
        it "deletages to .set" do
          columns = { :body => "Amaranth" }
          mock(Candidate.set).create(columns)
          Candidate.create(columns)
        end
      end

      describe ".unsafe_new" do
        it "instantiates a Tuple with the given field values without overriding the value of :id" do
          tuple = Candidate.unsafe_new(:id => "foo", :body => "Rice")
          tuple.id.should == "foo"
          tuple.body.should == "Rice"
        end
      end

      describe "#each" do
        specify "are forwarded to #tuples of #set" do
          tuples = []
          stub(Candidate.set).tuples { tuples }

          block = lambda {}
          mock(tuples).each(&block)
          Candidate.each(&block)
        end
      end
    end

    describe "instance methods" do
      def tuple
        @tuple ||= Candidate.new(:body => "Quinoa", :blog_id => "grain")
      end

      describe "#initialize" do
        it "assigns #fields_by_column to a hash with a Field object for every column declared in the set" do
          Candidate.set.columns.each do |column|
            field = tuple.fields_by_column[column]
            field.column.should == column
            field.tuple.should == tuple
          end
        end

        it "assigns the Field values in the given hash" do
          tuple.get_field_value(Candidate[:body]).should == "Quinoa"
          tuple.get_field_value(Candidate[:blog_id]).should == "grain"
        end

        it "assigns #id to a new guid" do
          tuple.id.should_not be_nil
        end
      end

      describe "#wire_representation" do
        it "returns #fields_by_column_name with string-valued keys" do
          tuple.wire_representation.should == tuple.field_values_by_column_name.stringify_keys
        end
      end

      describe "#save" do
        it "calls Origin.update with the #global_name of the Tuple's #set and its #field_values_by_column_name" do
          mock(Origin).update(tuple.set, tuple.field_values_by_column_name)
          tuple.save
        end
      end

      describe "#dirty?" do
        context "when a Tuple has been instantiated but not inserted into the Repository" do
          it "returns true" do
            tuple = Candidate.new
            tuple.should be_dirty
          end
        end

        context "when a Tuple has been inserted into the Repository and not modified since" do
          it "returns false" do
            tuple = Candidate.new(:blog_id => "grain", :body => "Bulgar Wheat")
            tuple.save
            tuple.should_not be_dirty
          end
        end

        context "when a Tuple has been inserted into the Repository and subsequently modified" do
          it "returns true" do
            tuple = Candidate.new(:blog_id => "grain", :body => "Bulgar Wheat")
            tuple.save
            tuple.body = "Wheat"
            tuple.should be_dirty
          end
        end

        context "when a Tuple is first loaded from a Repository" do
          it "returns false" do
            tuple = Candidate.find("grain_quinoa")
            tuple.should_not be_dirty
          end
        end

        context "when a Tuple has been modified since being loaded from the Repository" do
          it "returns true" do
            tuple = Candidate.find("grain_quinoa")
            tuple.body = "Red Rice"
            tuple.should be_dirty
          end
        end
      end

      describe "#field_values_by_column_name" do
        it "returns a hash with the values of all fields indexed by Column name" do
          expected_hash = {}
          tuple.fields_by_column.each do |column, field|
            expected_hash[column.name] = field.value
          end

          tuple.field_values_by_column_name.should == expected_hash
        end
      end
      
      describe "#set_field_value and #get_field_value" do
        specify "set and get a Field value" do
          tuple = Candidate.new
          tuple.set_field_value(Candidate[:body], "Quinoa")
          tuple.get_field_value(Candidate[:body]).should == "Quinoa"
        end
      end

      describe "#==" do
        context "for Tuples of the same class" do
          context "for Tuples with the same id" do
            it "returns true" do
              Candidate.find("grain_quinoa").should == Candidate.unsafe_new(:id => "grain_quinoa")
            end
          end

          context "for Tuples with different ids" do
            it "returns false" do
              Candidate.find("grain_quinoa").should_not == Candidate.unsafe_new(:id => "grain_barley")
            end
          end
        end

        context "for Tuples of different classes" do
          it "returns false" do
            Candidate.find("grain_quinoa").should_not == Blog.unsafe_new(:id => "grain_quinoa")
          end
        end
      end

      describe "remote query functionality" do
        def tuple
          @tuple ||= User.find("nathan")
        end

        describe "#build_relation_from_wire_representation" do
          it "delegates to Relation#from_wire_representation with self as the subdomain" do
            representation = {
              "type" => "set",
              "name" => "blogs"
            }
            mock(Relations::Relation).from_wire_representation(representation, tuple)
            tuple.build_relation_from_wire_representation(representation)
          end
        end

        describe "#fetch" do
          it "populates a relational snapshot with the contents of an array of wire representations of relations" do
            blogs_relation_representation = {
              "type" => "selection",
              "operand" => {
                "type" => "set",
                "name" => "blogs"
              },
              "predicate" => {
                "type" => "eq",
                "left_operand" => {
                  "type" => "column",
                  "set" => "blogs",
                  "name" => "id"
                },
                "right_operand" => {
                  "type" => "scalar",
                  "value" => "grain"
                }
              }
            }

            candidates_relation_representation = {
              "type" => "selection",
              "operand" => {
                "type" => "set",
                "name" => "candidates"
              },
              "predicate" => {
                "type" => "eq",
                "left_operand" => {
                  "type" => "column",
                  "set" => "candidates",
                  "name" => "blog_id"
                },
                "right_operand" => {
                  "type" => "scalar",
                  "value" => "grain"
                }
              }
            }

            snapshot = tuple.fetch([blogs_relation_representation, candidates_relation_representation])

            blogs_snapshot_fragment = snapshot["blogs"]
            blogs_snapshot_fragment.size.should == 1
            blogs_snapshot_fragment["grain"].should == Blog.find("grain").wire_representation
          end
        end

        describe "#get" do
          it "parses the 'relations' paramater from a JSON string into an array of wire representations and performs a #fetch with it, returning the resulting snapshot as a JSON string" do
            relations = [{ "type" => "set", "name" => "candidates"}]

            snapshot = nil
            mock.proxy(GlobalDomain.instance).fetch(relations) {|result| snapshot = result}

            response = tuple.get({"relations" => relations.to_json})

            response[0].should == 200
            response[1].should == { 'Content-Type' => 'application/json'}
            JSON.parse(response[2]).should == GlobalDomain.instance.fetch(relations)
          end
        end
      end
    end
  end
end
