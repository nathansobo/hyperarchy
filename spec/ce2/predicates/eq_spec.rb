require File.expand_path("#{File.dirname(__FILE__)}/../ce2_spec_helper")

module Predicates
  describe Eq do
    describe "#to_sql" do
      it "returns the left_operand.to_sql = right_operand.to_sql" do
        Eq.new(Answer.correct, false).to_sql.should == %{answers.correct = "f"}
      end
    end
  end
end
