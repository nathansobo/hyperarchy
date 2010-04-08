module Model
  module Relations
    class Grouping < Relation
      attr_reader :operand, :grouping_columns
      delegate :column, :surface_tables, :build_record_from_database, :sql_from_table_ref, :sql_where_clause_predicates, :to => :operand

      def initialize(operand, grouping_columns)
        @operand = operand
        @grouping_columns = grouping_columns.map {|c| column(c)}
      end

      def sql_grouping_column_refs(state)
        state[self][:sql_grouping_column_refs] ||=
          grouping_columns.map do |column|
            column.sql_expression(state)
          end
      end
    end
  end
end
