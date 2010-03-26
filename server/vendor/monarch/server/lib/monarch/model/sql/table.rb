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

      def joined_table_refs
        [self]
      end

      def join_conditions
        []
      end
    end
  end
end
