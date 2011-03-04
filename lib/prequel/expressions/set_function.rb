module Prequel
  module Expressions
    class SetFunction < Expression
      attr_reader :expression, :type

      def initialize(expression, type)
        @expression, @type = expression, type
      end

      def resolve_in_relations(relations)
        SetFunction.new(expression.resolve_in_relations(relations), type)
      end

      def resolve_in_query(query)
        SetFunction.new(expression.resolve_in_query(query), type)
      end

      def to_sql
        "#{type}(#{expression.to_sql})"
      end
    end
  end
end

