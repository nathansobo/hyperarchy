module Model
  module Predicates
    class Neq < Eq
      def force_matching_field_values(field_values={})
        raise "Not implemented for Neq"
      end

      def sql_predicate
        Sql::Expressions::Neq.new(left_operand.sql_expression, right_operand.sql_expression)
      end
    end
  end
end
