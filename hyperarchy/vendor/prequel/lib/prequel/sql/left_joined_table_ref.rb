module Prequel
  module Sql
    class LeftJoinedTableRef < JoinedTableRef

      def flatten_table_refs
        [[self], []]
      end

      protected

      def join_type
        "left outer join"
      end
    end
  end
end