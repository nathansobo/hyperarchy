module Model
  module Sql
    class QuerySpecification
      # :set_quantifier can be 'distinct' or 'all'
      # :select_list is populated with DerivedColumn or Asterisk instances
      # :from_clause is populated by a "table reference", which can be a Table, AliasedTable, DerivedTable, or JoinedTable
      # :where clause
      # :grouping_column_refs is populated by GroupingColumnRef objects
      attr_accessor :set_quantifier, :select_list, :from_clause_table_refs, :where_clause_predicates, :grouping_column_refs

      def initialize(set_quantifier, select_list, from_clause_table_ref, where_clause_predicates=[], grouping_column_refs=[])
        @set_quantifier = set_quantifier
        @select_list = select_list
        @from_clause_table_refs = [from_clause_table_ref]
        @where_clause_predicates = where_clause_predicates
        @grouping_column_refs = grouping_column_refs

        flatten
      end

      def to_sql
        ["select",
         set_quantifier_sql,
         select_list_sql,
         "from",
         from_clause_sql,
         where_clause_sql
        ].compact.join(" ")
      end

      protected


      def flatten
        @where_clause_predicates = (where_clause_predicates + from_clause_table_refs.first.join_conditions).map do |predicate|
          predicate.flatten
        end.flatten.uniq
        @from_clause_table_refs = from_clause_table_refs.first.joined_table_refs
      end

      def set_quantifier_sql
        nil
      end

      def select_list_sql
        select_list.map do |select_column|
          select_column.to_sql
        end.join(", ")
      end

      def from_clause_sql
        from_clause_table_refs.map do |table_ref|
          table_ref.to_sql
        end.join(", ")
      end

      def where_clause_sql
        return nil if where_clause_predicates.empty?
        "where " + where_clause_predicates.map do |predicate|
          predicate.to_sql
        end.sort.join(" and ")
      end
    end
  end
end
