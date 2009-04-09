module Predicates
  class Eq
    attr_reader :left_operand, :right_operand

    def initialize(left_operand, right_operand)
      @left_operand, @right_operand = left_operand, right_operand
    end

    def to_sql
      "#{left_operand.to_sql} = #{right_operand.to_sql}"
    end
  end
end