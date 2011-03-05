module Prequel
  module Expressions
    class OrderExpression
      attr_reader :expression, :direction

      def initialize(expression, direction)
        @expression, @direction = expression, direction
      end

      def resolve_in_relations(relations)
        OrderExpression.new(expression.resolve_in_relations(relations), direction)
      end

      def resolve_in_query(query)
        OrderExpression.new(expression.resolve_in_query(query), direction)
      end

      def to_sql
        "#{expression.to_sql} #{direction}"
      end
    end
  end
end
