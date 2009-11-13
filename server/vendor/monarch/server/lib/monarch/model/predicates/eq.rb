module Model
  module Predicates
    class Eq < Predicate
      class << self
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

      def initialize(left_operand, right_operand)
        @left_operand, @right_operand = left_operand, right_operand
      end

      def to_sql
        "#{left_operand.to_sql} #{sql_operator} #{right_operand.to_sql}"
      end

      def ==(other_predicate)
        return false unless other_predicate.instance_of?(self.class)
        other_predicate.left_operand == left_operand && other_predicate.right_operand == right_operand
      end

      def force_matching_field_values(field_values={})
        field_values.merge(column_operand.name => scalar_operand)
      end

      protected

      def sql_operator
        if left_operand.nil? || right_operand.nil?
          "is"
        else
          "="
        end
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
  end
end
