module Predicates
  class Eq < Predicate
    class << self
      def from_wire_representation(representation)
        left_operand = operand_from_wire_representation(representation["left_operand"])
        right_operand = operand_from_wire_representation(representation["right_operand"])
        new(left_operand, right_operand)
      end

      def operand_from_wire_representation(representation)
        case representation["type"]
        when "scalar"
          representation["value"]
        when "attribute"
          Attribute.from_wire_representation(representation)
        else
          raise "cannot translate #{representation} into an operand"
        end
      end
    end

    attr_reader :left_operand, :right_operand

    def initialize(left_operand, right_operand)
      @left_operand, @right_operand = left_operand, right_operand
    end

    def to_sql
      "#{left_operand.to_sql} = #{right_operand.to_sql}"
    end
  end
end