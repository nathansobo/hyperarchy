module Model
  module Expressions
    class Plus
      attr_reader :left_operand, :right_operand

      def initialize(left_operand, right_operand)
        @left_operand, @right_operand = left_operand, right_operand
      end

      def sql_expression
        Sql::Expressions::Plus.new(left_operand.sql_expression, right_operand.sql_expression)
      end
    end
  end
end