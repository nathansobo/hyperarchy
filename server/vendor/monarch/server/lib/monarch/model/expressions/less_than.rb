module Model
  module Expressions
    class LessThan < Predicate
      attr_reader :left_operand, :right_operand

      def initialize(left_operand, right_operand)
        @left_operand, @right_operand = left_operand, right_operand
      end

      def sql_predicate
        Sql::Expressions::LessThan.new(left_operand.sql_expression, right_operand.sql_expression)
      end
    end
  end
end