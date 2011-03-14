module Prequel
  module Sql
    class InnerJoinedTableRef < JoinedTableRef
      protected

      def join_type
        "inner join"
      end
    end
  end
end