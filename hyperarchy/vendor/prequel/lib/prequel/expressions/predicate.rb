module Prequel
  module Expressions
    class Predicate
      extend EqualityDerivation

      attr_reader :left, :right
      def initialize(left, right)
        @left, @right = left, right
      end

      def resolve_in_relations(relations)
        self.class.new(left.resolve_in_relations(relations), right.resolve_in_relations(relations))
      end

      def resolve_in_query(query)
        self.class.new(left.resolve_in_query(query), right.resolve_in_query(query))
      end

      def to_predicate
        self
      end

      derive_equality :type, :left, :right

      def to_sql
        "#{left.to_sql} #{operator_sql} #{right.to_sql}"
      end

      def wire_representation
        {
          'type' => type.to_s,
          'left_operand' => left.wire_representation,
          'right_operand' => right.wire_representation
        }
      end
    end
  end
end
