module Model
  module Expressions
    class SortSpecification
      attr_reader :column, :direction
      def initialize(column, direction)
        @column, @direction = column, direction
      end

      def sql_sort_specification
        Sql::SortSpecification.new(column.sql_expression, direction)
      end
    end
  end
end