module Prequel
  module Expressions
    class Equal < Predicate
      def enhance_attributes(attributes)
        attributes.merge(left.name => right)
      end

      def type
        :eq
      end

      def operator_sql
        if left.nil? || right.nil?
          'is'
        else
          '='
        end
      end
    end
  end
end
