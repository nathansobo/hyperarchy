module Prequel
  module Expressions
    class And < Predicate
      def type
        :and
      end

      def operator_sql
        'and'
      end
    end
  end
end
