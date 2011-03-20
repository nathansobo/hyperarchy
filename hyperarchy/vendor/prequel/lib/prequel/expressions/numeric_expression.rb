module Prequel
  module Expressions
    class NumericExpression
      extend EqualityDerivation
      attr_reader :operator, :left, :right

      def initialize(operator, left, right)
        @operator, @left, @right = operator, left, right
      end

      def resolve_in_relations(relations)
        NumericExpression.new(operator, left.resolve_in_relations(relations), right.resolve_in_relations(relations))
      end

      def resolve_in_query(query)
        NumericExpression.new(operator, left.resolve_in_query(query), right.resolve_in_query(query))
      end

      derive_equality :operator, :left, :right

      def to_sql
        "#{left.to_sql} #{operator} #{right.to_sql}"
      end

      def to_set_clause_sql
        "#{left.to_set_clause_sql} #{operator} #{right.to_set_clause_sql}"
      end
    end
  end
end
