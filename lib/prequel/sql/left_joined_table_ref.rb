module Prequel
  module Sql
    class LeftJoinedTableRef < JoinedTableRef
      protected

      def join_type
        "left outer join"
      end
    end
  end
end