module Model
  module Sql
    # Represents the set of all columns in a given table ref at the surface of a table ref that contains it
    # QuerySpecification#select_list is populated with DerivedColumn and Asterisk objects
    class Asterisk
      attr_accessor :table_ref # optional, can be a table or correlation name

      def initialize(table_ref=nil)
        @table_ref = table_ref
      end

      def to_sql
        "#{table_ref.name}.*"
      end

      def derive(deriving_table_ref, &block)
        table_ref.algebra_columns.map do |algebra_column|
          algebra_column.sql_expression.derive(deriving_table_ref, &block)
        end
      end
    end
  end
end