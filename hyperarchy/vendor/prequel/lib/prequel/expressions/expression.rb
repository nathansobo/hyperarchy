module Prequel
  module Expressions
    class Expression
      def as(alias_name)
        AliasedExpression.new(self, alias_name)
      end

      def normalize_field_value(value)
        value
      end
    end
  end
end

