module Prequel
  module Relations
    class Offset < Relation
      include UnaryRelationMethods

      attr_reader :operand, :count

      def initialize(operand, count)
        @operand, @count = operand, count
      end

      def visit(query)
        operand.visit(query)
        query.offset = count
      end

      derive_equality :operand, :count
    end
  end
end
