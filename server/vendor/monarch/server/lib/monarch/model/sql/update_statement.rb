module Model
  module Sql
    class UpdateStatement < Block
      attr_reader :target_table_ref, :set_clause_assignments, :from_clause_table_refs, :where_clause_predicates
      def initialize(target_table_ref, set_clause_assignments, from_clause_table_ref, where_clause_predicates)
        @target_table_ref = target_table_ref
        @set_clause_assignments = set_clause_assignments
        @from_clause_table_refs = [from_clause_table_ref].compact
        @where_clause_predicates = where_clause_predicates || []

        flatten_and_uniq_inner_joins unless from_clause_table_refs.empty?
      end

      def to_sql
        ["update",
         target_table_ref.name,
         "set",
         set_clause_assignments_sql,
         from_clause_sql,
         where_clause_sql
        ].join(" ")
      end

      protected
      def set_clause_assignments_sql
        set_clause_assignments.map do |column_ref, expression|
          "#{column_ref.name} = #{expression.to_sql}"
        end.sort.join(", ")
      end

      def from_clause_sql
        super unless from_clause_table_refs == [target_table_ref]
      end
    end
  end
end
