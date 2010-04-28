module Monarch
  module Model
    module Expressions
      class Eq < BinaryExpression
        def initialize(left_operand, right_operand)
          super
          convert_string_to_integer_if_needed if Model.convert_strings_to_keys
        end

        def force_matching_field_values(field_values={})
          scalar_value = scalar_operand.is_a?(Field) ? scalar_operand.value : scalar_operand
          field_values.merge(column_operand.name => scalar_value)
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

        def convert_string_to_integer_if_needed
          if left_operand.is_a?(Column) && left_operand.type == :key && right_operand.instance_of?(String)
            @right_operand = left_operand.convert_value_for_storage(right_operand)
          elsif right_operand.is_a?(Column) && right_operand.type == :key && left_operand.instance_of?(String)
            @left_operand = right_operand.convert_value_for_storage(left_operand)
          end
        end
      end
    end
  end
end