module Prequel
  module Expressions
    class GreaterThanOrEqual < Predicate
      def type
        :gte
      end

      def operator_sql
        '>='
      end
    end
  end
end
