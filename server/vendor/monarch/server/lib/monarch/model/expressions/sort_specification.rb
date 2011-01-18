module Monarch
  module Model
    module Expressions
      class SortSpecification
        attr_reader :column, :direction
        def initialize(column, direction)
          @column, @direction = column, direction
        end

        def sql_sort_specification(state)
          state[self][:sql_sort_specification] ||=
            Sql::SortSpecification.new(column.sql_expression(state), direction)
        end

        def ==(other)
          return false unless other.instance_of?(self.class)
          other.column == column && other.direction == direction
        end
      end
    end
  end
end