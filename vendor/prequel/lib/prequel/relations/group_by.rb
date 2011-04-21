module Prequel
  module Relations
    class GroupBy < Relation
      include UnaryRelationMethods

      attr_reader :operand, :expressions

      def initialize(operand, *expressions)
        @operand = operand
        @expressions = expressions.map do |expression|
          resolve(expression)
        end
      end

      def visit(query)
        operand.visit(query)
        query.group_bys = expressions.map do |expression|
          expression.resolve_in_query(query)
        end
      end

      derive_equality :operand, :expressions

      def pull_up_conditions
        GroupBy.new(operand.pull_up_conditions, *expressions)
      end
    end
  end
end
