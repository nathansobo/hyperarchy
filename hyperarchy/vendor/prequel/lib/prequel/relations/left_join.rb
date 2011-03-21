module Prequel
  module Relations
    class LeftJoin < Join
      def pull_up_conditions
        self
      end

      protected

      def table_ref_class
        Sql::LeftJoinedTableRef
      end
    end
  end
end
