require File.expand_path("#{File.dirname(__FILE__)}/../../eden_spec_helper")

module Model
  describe Column do
    describe "class methods" do
      describe ".from_wire_representation" do
        it "returns a Column based on the 'set' and 'name' of the given representation" do
          column = Column.from_wire_representation({
            "type" => "column",
            "set" => "candidates",
            "name" => "body"
          })

          column.should == Candidate[:body]
        end
      end
    end

    describe "instance methods" do
      describe "#to_sql" do
        it "returns the qualified column name" do
          Candidate[:body].to_sql.should == "candidates.body"
        end
      end

      describe "#eq" do
        it "returns an instance of Predicates::Eq with self as #left_operand and the argument as #right_operand" do
          predicate = Candidate[:id].eq("grain_quinoa")
          predicate.class.should == Predicates::Eq
          predicate.left_operand.should == Candidate[:id]
          predicate.right_operand.should == "grain_quinoa"
        end
      end
    end
  end
end
