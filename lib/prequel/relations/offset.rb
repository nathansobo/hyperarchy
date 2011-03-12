module Prequel
  module Relations
    class Offset < Relation
      attr_reader :operand, :count

      def initialize(operand, count)
        @operand, @count = operand, count
      end

      def visit(query)
        operand.visit(query)
        query.offset = count
      end
    end
  end
end
