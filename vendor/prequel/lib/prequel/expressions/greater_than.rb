module Prequel
  module Expressions
    class GreaterThan < Predicate
      def type
        :gt
      end

      def operator_sql
        '>'
      end
    end
  end
end
