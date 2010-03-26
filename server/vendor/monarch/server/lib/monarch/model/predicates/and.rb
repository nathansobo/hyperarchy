module Model
  module Predicates
    class And < Predicate
      attr_reader :operands
      def initialize(operands)
        @operands = operands
      end

      def sql_predicate
        Sql::Expressions::And.new(operands.map {|op| op.sql_predicate})
      end
    end
  end
end
