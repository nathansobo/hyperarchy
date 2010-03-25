require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Model
  module Relations
    describe Aggregation do
      attr_reader :operand, :expressions, :aggregation
      before do
        @operand = User.table
        @expressions = [AggregationExpression.new("max", User[:signed_up_at]).as(:max_signed_up_at), AggregationExpression.new("sum", User[:age])]
        @aggregation = Aggregation.new(operand, expressions)
      end

      describe "#all" do
        it "returns tuples for each column in the aggregation, which can be referenced by expression alias or expression index" do
          all = aggregation.all
          all.size.should == 1
          tuple = all.first

          tuple.max_signed_up_at.should_not be_nil
          tuple[1].should be >= 60
        end

        specify "the tuples it returns cast their fields to the appropriate datatype based on the expression and the column type" do
          User.aggregate(User[:signed_up_at].max).value.should be_a(Time)
          User.aggregate(User[:age].max).value.should be_an(Integer)
          User.aggregate(User[:id].count).value.should be_an(Integer)
        end
      end

      describe "#to_sql" do
        it "returns sql with the appropriate aggregation functions in the select clause" do
          aggregation.to_sql.should == "select max(users.signed_up_at) as max_signed_up_at, sum(users.age) from users"
        end
      end

      describe "#==" do
        it "structurally compares the receiver with the operand" do
          operand_2 = User.table
          expressions_2 = [AggregationExpression.new("max", User[:signed_up_at]).as(:max_signed_up_at), AggregationExpression.new("sum", User[:age])]
          aggregation_2 = Aggregation.new(operand_2, expressions_2)

          aggregation.should == aggregation_2
        end
      end
    end
  end
end
