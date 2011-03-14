module Prequel
  module Relations
    class OrderBy < Relation
      attr_reader :operand, :order_expressions

      def initialize(operand, *order_expressions)
        @operand = operand
        @order_expressions = order_expressions.map do |order_expression|
          resolve(order_expression)
        end
      end

      def visit(query)
        operand.visit(query)
        query.order_bys = order_expressions.map do |spec|
          spec.resolve_in_query(query)
        end
      end

      derive_equality :operand, :order_expressions
      
      protected

      def operands
        [operand]
      end
    end
  end
end
