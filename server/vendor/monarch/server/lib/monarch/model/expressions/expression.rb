module Model
  module Expressions
    class Expression
      def derive(relation)
        DerivedColumn.new(relation, self, name)
      end

      def as(name)
        AliasedExpression.new(self, name)
      end
    end
  end
end