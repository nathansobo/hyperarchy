module Model
  module Relations
    class Grouping < UnaryOperator
      attr_reader :operand, :grouping_columns
      delegate :column, :surface_tables, :build_record_from_database, :external_sql_select_list, :internal_sql_table_ref, :internal_sql_where_predicates, :to => :operand

      def initialize(operand, grouping_columns)
        @operand = operand
        @grouping_columns = grouping_columns.map {|c| column(c)}
      end

      def internal_sql_grouping_column_refs(state)
        state[self][:internal_sql_grouping_column_refs] ||=
          grouping_columns.map do |column|
            column.sql_expression(state)
          end
      end
    end
  end
end
