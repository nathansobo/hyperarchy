module Monarch
  module Model
    module Sql
      class UpdateStatement < Block
        attr_reader :set_clause_assignments, :from_clause_table_refs, :where_clause_predicates
        def initialize(set_clause_assignments, from_clause_table_ref, where_clause_predicates)
          @set_clause_assignments = set_clause_assignments
          @from_clause_table_refs = [from_clause_table_ref].compact
          @where_clause_predicates = where_clause_predicates || []

          flatten_and_uniq_inner_joins unless from_clause_table_refs.empty?
        end

        def to_sql
          ["update",
          update_table_sql,
           "set",
           set_clause_assignments_sql,
           from_tables_sql,
           where_clause_sql
          ].join(" ")
        end

        def update_table_sql
          from_clause_table_refs.first.to_sql
        end

        def from_tables_sql
          return nil unless from_clause_table_refs.length > 1
          "from " + from_clause_table_refs.drop(1).map do |table_ref|
            table_ref.to_sql
          end.join(", ")
        end

        protected
        def set_clause_assignments_sql
          set_clause_assignments.map do |column_ref, expression|
            "#{column_ref.name} = #{expression.to_sql}"
          end.sort.join(", ")
        end
      end
    end
  end
end