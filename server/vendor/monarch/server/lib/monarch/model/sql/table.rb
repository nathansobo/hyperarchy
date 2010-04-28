module Monarch
  module Model
    module Sql
      class Table
        attr_reader :algebra_table

        def initialize(algebra_table)
          @algebra_table = algebra_table
        end

        def to_sql
          name
        end

        def name
          algebra_table.global_name
        end

        def algebra_columns
          algebra_table.concrete_columns
        end

        def inner_joined_table_refs
          [self]
        end

        def inner_join_conditions
          []
        end

        def evaluate_algebra_expression(expression)
          case expression
            when DerivedColumn
          end

        end
      end
    end
  end
end