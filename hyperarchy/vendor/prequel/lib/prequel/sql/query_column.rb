module Prequel
  module Sql
    class QueryColumn
      attr_reader :table_ref, :name
      def initialize(table_ref, name)
        @table_ref, @name = table_ref, name
      end

      def to_sql
        "#{table_ref.name}.#{name}"
      end

      def to_select_clause_sql
        to_sql
      end

      def qualified_name
        "#{table_ref.name}__#{name}"
      end
    end
  end
end
