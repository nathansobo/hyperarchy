module Prequel
  module Expressions
    class SetFunction < Expression
      attr_reader :expression, :name

      def initialize(expression, name)
        @expression, @name = expression, name
      end

      def resolve_in_relations(relations)
        SetFunction.new(expression.resolve_in_relations(relations), name)
      end

      def resolve_in_query(query)
        SetFunction.new(expression.resolve_in_query(query), name)
      end

      def to_sql
        "#{name}(#{expression.to_sql})"
      end
    end
  end
end

