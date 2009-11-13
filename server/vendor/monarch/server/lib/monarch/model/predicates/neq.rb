module Model
  module Predicates
    class Neq < Eq
      def force_matching_field_values(field_values={})
        raise "Not implemented for Neq"
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
