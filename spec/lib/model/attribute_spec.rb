require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Model
  describe Attribute do
    describe "class methods" do
      describe ".from_wire_representation" do
        it "returns an Attribute based on the 'set' and 'name' of the given representation" do
          attribute = Attribute.from_wire_representation({
            "type" => "attribute",
            "set" => "candidates",
            "name" => "body"
          })

          attribute.should == Candidate.body
        end
      end
    end

    describe "instance methods" do
      describe "#to_sql" do
        it "returns the qualified attribute name" do
          Candidate.body.to_sql.should == "candidates.body"
        end
      end

      describe "#eq" do
        it "returns an instance of Predicates::Eq with self as #left_operand and the argument as #right_operand" do
          predicate = Candidate.id.eq("grain_quinoa")
          predicate.class.should == Predicates::Eq
          predicate.left_operand.should == Candidate.id
          predicate.right_operand.should == "grain_quinoa"
        end
      end
    end
  end
end