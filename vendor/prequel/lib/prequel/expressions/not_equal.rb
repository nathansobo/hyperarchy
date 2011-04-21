module Prequel
  module Expressions
    class NotEqual < Predicate
      def type
        :neq
      end

      def operator_sql
        if left.nil? || right.nil?
          'is not'
        else
          '!='
        end
      end
    end
  end
end
