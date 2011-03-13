module Prequel
  module Relations
    class GroupBy < Relation
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

      protected

      def operands
        [operand]
      end
    end
  end
end
