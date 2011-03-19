module Prequel
  module Relations
    class Selection < Relation
      attr_reader :operand, :predicate

      def initialize(operand, predicate)
        @operand = operand
        @predicate = resolve(predicate.to_predicate)
      end

      def create(attributes={})
        operand.create(predicate.enhance_attributes(attributes))
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

      derive_equality :predicate, :operand

      def wire_representation
        {
          'type' => "selection",
          'operand' => operand.wire_representation,
          'predicate' => predicate.wire_representation
        }
      end

      protected

      def operands
        [operand]
      end
    end
  end
end

