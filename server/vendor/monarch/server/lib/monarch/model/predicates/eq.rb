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
        convert_string_to_integer_if_needed
      end

      def to_sql
        "#{left_operand.to_sql} #{sql_operator} #{right_operand.to_sql}"
      end

      def ==(other)
        return false unless other.instance_of?(self.class)
        left_operand == other.left_operand && right_operand == other.right_operand ||
          left_operand == other.right_operand  && right_operand == other.left_operand
      end

      def force_matching_field_values(field_values={})
        field_values.merge(column_operand.name => scalar_operand)
      end

      def matches?(record)
        record.evaluate(left_operand) == record.evaluate(right_operand)
      end

      def find_matching_tuples(record, relation)
        join_field = record.field(left_operand) || record.field(right_operand)
        join_column = relation.column(left_operand) || relation.column(right_operand)
        relation.where(join_column.eq(join_field.value))
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

      def convert_string_to_integer_if_needed
        return unless Model.convert_strings_to_keys

        if left_operand.instance_of?(ConcreteColumn) && left_operand.type == :key && right_operand.instance_of?(String)
          @right_operand = left_operand.convert_value_for_storage(right_operand)
        elsif right_operand.instance_of?(ConcreteColumn) && right_operand.type == :key && left_operand.instance_of?(String)
          @left_operand = right_operand.convert_value_for_storage(left_operand)
        end 
      end
    end
  end
end
