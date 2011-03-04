module Prequel
  module Sql
    class TableRef
      include NamedTableRef
      attr_reader :relation, :query_columns
      delegate :name, :columns, :tuple_class, :to => :relation

      def initialize(relation)
        @relation = relation
        @query_columns = {}
      end

      def to_sql
        name
      end

      def resolve_column(column)
        query_columns[column] ||= Sql::QueryColumn.new(self, column.name)
      end

      def build_tuple(field_values)
        tuple_class.new(extract_field_values(field_values))
      end
    end
  end
end
