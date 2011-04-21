module Prequel
  module Sql
    class InnerJoinedTableRef < JoinedTableRef
      def flatten_table_refs
        left_table_refs, left_predicates = left.flatten_table_refs
        right_table_refs, right_predicates = right.flatten_table_refs
        [left_table_refs + right_table_refs, left_predicates + [predicate] + right_predicates]
      end

      protected

      def join_type
        "inner join"
      end
    end
  end
end