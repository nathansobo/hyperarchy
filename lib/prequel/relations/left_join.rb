module Prequel
  module Relations
    class LeftJoin < Join
      protected

      def table_ref_class
        Sql::LeftJoinedTableRef
      end
    end
  end
end
