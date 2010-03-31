module Model
  module Sql
    class QuerySpecification < Block
      # :set_quantifier can be 'distinct' or 'all'
      # :select_list is populated with DerivedColumn or Asterisk instances
      # :from_clause is populated by a "table reference", which can be a Table, AliasedTable, DerivedTable, or InnerJoinedTable
      # :where clause
      # :grouping_column_refs is populated by GroupingColumnRef objects
      attr_accessor :set_quantifier, :select_list, :from_clause_table_refs, :where_clause_predicates, :grouping_column_refs

      def initialize(set_quantifier, select_list, from_clause_table_ref, where_clause_predicates=[], grouping_column_refs=[])
        @set_quantifier = set_quantifier
        @select_list = select_list
        @from_clause_table_refs = [from_clause_table_ref]
        @where_clause_predicates = where_clause_predicates
        @grouping_column_refs = grouping_column_refs

        flatten_and_uniq_inner_joins
      end

      def to_sql
        ["select",
         set_quantifier_sql,
         select_list_sql,
         "from",
         from_tables_sql,
         where_clause_sql
        ].compact.join(" ")
      end

      protected
      def set_quantifier_sql
        nil
      end

      def select_list_sql
        select_list.map do |select_column|
          select_column.to_sql
        end.join(", ")
      end
    end
  end
end
