module Model
  module Predicates
    class Neq < Eq
      def force_matching_field_values(field_values={})
        raise "Not implemented for Neq"
      end

      def sql_predicate
        Sql::Predicates::Neq.new(left_operand.sql_expression, right_operand.sql_expression)
      end

      protected
      def sql_operator
        if left_operand.nil? || right_operand.nil?
          "is not"
        else
          "!="
        end
      end
    end
  end
end
