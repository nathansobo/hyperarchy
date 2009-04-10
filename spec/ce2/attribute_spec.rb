require File.expand_path("#{File.dirname(__FILE__)}/ce2_spec_helper")

describe Attribute do
  describe "#to_sql" do
    it "returns the qualified attribute name" do
      Answer.correct.to_sql.should == "answers.correct"
    end
  end

  describe "#eq" do
    it "returns an instance of Predicates::Eq with self as #left_operand and the argument as #right_operand" do
      predicate = Answer.id.eq("grain_quinoa")
      predicate.class.should == Predicates::Eq
      predicate.left_operand.should == Answer.id
      predicate.right_operand.should == "grain_quinoa"
    end
  end
end