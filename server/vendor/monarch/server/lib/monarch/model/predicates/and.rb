module Model
  module Predicates
    class And < Predicate
      attr_reader :left_operand, :right_operand
      def initialize(left_operand, right_operand)
        @left_operand, @right_operand = left_operand, right_operand
      end

      def to_sql
        "(#{left_operand.to_sql} AND #{right_operand.to_sql})"
      end
    end
  end
end
