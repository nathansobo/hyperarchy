module Monarch
  module Model
    module Expressions
      class Eq < BinaryExpression
        def force_matching_field_values(field_values={})
          scalar_value = scalar_operand.is_a?(Field) ? scalar_operand.value : scalar_operand
          field_values.merge(column_operand.name => scalar_value)
        end

        def matches?(record)
          record.evaluate(left_operand) == record.evaluate(right_operand)
        end

        def find_matchingstoredTuples(record, relation)
          join_field = record.field(left_operand) || record.field(right_operand)
          join_column = relation.column(left_operand) || relation.column(right_operand)
          relation.where(join_column.eq(join_field.value))
        end
      end
    end
  end
end
