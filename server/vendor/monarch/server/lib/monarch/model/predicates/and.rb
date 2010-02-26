module Model
  module Predicates
    class And < Predicate
      attr_reader :operands
      def initialize(operands)
        @operands = operands
      end

      def to_sql
        "(#{operands.map {|op| op.to_sql}.join(" and ")})"
      end
    end
  end
end
