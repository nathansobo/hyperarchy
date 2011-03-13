module Prequel
  module Relations
    class Selection < Relation
      attr_reader :operand, :predicate

      def initialize(operand, predicate)
        @operand = operand
        @predicate = resolve(predicate.to_predicate)
      end

      delegate :get_table, :infer_join_columns, :to => :operand

      def columns
        operand.columns.map do |column|
          derive(column)
        end
      end

      def visit(query)
        operand.visit(query)
        query.add_condition(predicate.resolve_in_query(query))
      end

      def ==(other)
        return false unless other.instance_of?(self.class)
        p predicate == other.predicate
        p operand == other.operand
        predicate == other.predicate && operand == other.operand
      end

      protected

      def operands
        [operand]
      end
    end
  end
end
