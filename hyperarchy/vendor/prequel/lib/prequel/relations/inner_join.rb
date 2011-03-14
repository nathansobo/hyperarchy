module Prequel
  module Relations
    class InnerJoin < Join
      protected

      def table_ref_class
        Sql::InnerJoinedTableRef
      end
    end
  end
end
