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

        protected
        def set_clause_assignments_sql
          set_clause_assignments.map do |column_ref, expression|
            set_clause_assignment_sql(column_ref, expression)
          end.sort.join(", ")
        end
      end
    end
  end
end