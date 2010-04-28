module Monarch
  module Model
    module Sql
      class QuerySpecification < Block
        # :set_quantifier can be 'distinct' or 'all'
        # :select_list is populated with DerivedColumn or Asterisk instances
        # :from_clause is populated by a "table reference", which can be a Table, AliasedTable, DerivedTable, or InnerJoinedTable
        # :where clause
        # :grouping_column_refs is populated by GroupingColumnRef objects
        attr_accessor :set_quantifier, :select_list, :from_clause_table_refs, :where_clause_predicates,
                      :grouping_column_refs, :sort_specifications

        def initialize(set_quantifier, select_list, from_clause_table_ref, where_clause_predicates, sort_specifications, grouping_column_refs)
          @set_quantifier = set_quantifier
          @select_list = select_list
          @from_clause_table_refs = [from_clause_table_ref]
          @where_clause_predicates = where_clause_predicates
          @sort_specifications = sort_specifications
          @grouping_column_refs = grouping_column_refs

          flatten_and_uniq_inner_joins
        end

        def to_sql
          ["select",
           set_quantifier_sql,
           select_list_sql,
           "from",
           from_tables_sql,
           where_clause_sql,
           group_by_clause_sql,
           order_by_clause_sql
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

        def group_by_clause_sql
          return nil if grouping_column_refs.empty?
          "group by " + grouping_column_refs.map do |column_ref|
            column_ref.to_sql
          end.join(", ")
        end

        def order_by_clause_sql
          return nil if sort_specifications.empty?
          "order by " + sort_specifications.map do |sort_spec|
            sort_spec.to_sql
          end.join(", ")
        end
      end
    end
  end
end