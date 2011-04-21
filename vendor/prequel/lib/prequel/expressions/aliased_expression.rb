module Prequel
  module Expressions
    class AliasedExpression
      attr_reader :expression, :alias_name

      def initialize(expression, alias_name)
        @expression, @alias_name = expression, alias_name
      end

      def resolve_in_relations(relations)
         AliasedExpression.new(expression.resolve_in_relations(relations), alias_name)
      end
    end
  end
end
