module Prequel
  module Expressions
    class LessThanOrEqual < Predicate
      def type
        :lte
      end

      def operator_sql
        '<='
      end
    end
  end
end
