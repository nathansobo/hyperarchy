module Prequel
  module Relations
    class Limit < Relation
      attr_reader :operand, :count

      def initialize(operand, count)
        @operand, @count = operand, count
      end

      def visit(query)
        operand.visit(query)
        query.limit = count
      end

      derive_equality :operand, :count
    end
  end
end
