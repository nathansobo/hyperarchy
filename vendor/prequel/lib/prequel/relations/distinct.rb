module Prequel
  module Relations
    class Distinct < Relation
      include UnaryRelationMethods

      attr_reader :operand

      def initialize(operand)
        @operand = operand
      end

      def visit(query)
        operand.visit(query)
        query.distinct = true
      end

      derive_equality :operand
    end
  end
end
