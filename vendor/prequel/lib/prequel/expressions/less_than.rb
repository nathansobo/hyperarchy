module Prequel
  module Expressions
    class LessThan < Predicate
      def type
        :lt
      end

      def operator_sql
        '<'
      end
    end
  end
end
