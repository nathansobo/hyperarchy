module Model
  module Expressions
    class BinaryExpression < Expression
      class << self
        def sql_expression_class
          @sql_expression_class ||= Sql::Expressions.const_get(basename)
        end

        def from_wire_representation(representation, repository)
          left_operand = operand_from_wire_representation(representation["left_operand"], repository)
          right_operand = operand_from_wire_representation(representation["right_operand"], repository)
          new(left_operand, right_operand)
        end

        def operand_from_wire_representation(representation, repository)
          case representation["type"]
          when "scalar"
            representation["value"]
          when "column"
            ConcreteColumn.from_wire_representation(representation, repository)
          else
            raise "cannot translate #{representation} into an operand"
          end
        end
      end

      attr_reader :left_operand, :right_operand
      delegate :sql_expression_class, :to => "self.class"

      def initialize(left_operand, right_operand)
        @left_operand, @right_operand = left_operand, right_operand
      end

      def ==(other)
        return false unless other.instance_of?(self.class)
        left_operand == other.left_operand && right_operand == other.right_operand ||
          left_operand == other.right_operand && right_operand == other.left_operand
      end

      def sql_expression(state)
        state[self][:sql_expression] ||=
          sql_expression_class.new(left_operand.sql_expression(state), right_operand.sql_expression(state))
      end

      def column_operand
        return left_operand if left_operand.instance_of?(ConcreteColumn)
        return right_operand if right_operand.instance_of?(ConcreteColumn)
        raise "No column operands"
      end

      def scalar_operand
        return left_operand unless left_operand.instance_of?(ConcreteColumn)
        return right_operand unless right_operand.instance_of?(ConcreteColumn)
        raise "No scalar operands"
      end
    end

    class Plus < BinaryExpression; end
    class Minus < BinaryExpression; end
    class LessThan < BinaryExpression; end
    class GreaterThan < BinaryExpression; end
    class Neq < BinaryExpression; end
  end
end