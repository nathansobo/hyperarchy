module Model
  module Sql
    class Block
      protected

      def flatten_and_uniq_inner_joins
        @where_clause_predicates = (where_clause_predicates + from_clause_table_refs.first.inner_join_conditions).map do |predicate|
          predicate.flatten
        end.flatten.uniq
        @from_clause_table_refs = from_clause_table_refs.first.inner_joined_table_refs
      end

      def from_clause_sql
        "from " + from_clause_table_refs.map do |table_ref|
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