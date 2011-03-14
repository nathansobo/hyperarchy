module Prequel
  module Expressions
    class Expression
      def as(alias_name)
        AliasedExpression.new(self, alias_name)
      end
    end
  end
end

