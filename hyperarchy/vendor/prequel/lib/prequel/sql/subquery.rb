module Prequel
  module Sql
    class Subquery
      include NamedTableRef

      attr_reader :parent, :child_query, :query_columns, :name
      delegate :add_subquery, :add_singular_table_ref, :singular_table_refs, :literals, :to => :parent

      def initialize(relation, parent, name)
        @parent = parent
        @child_query = Query.new(relation, self)
        @name = name
        @query_columns = {}
      end

      def build
        child_query.build
        self
      end

      def to_sql
        "(#{child_query.to_sql[0]}) as #{name}"
      end

      def resolve_derived_column(column, alias_name=nil, qualified=false)
        query_columns[column] ||= begin
          child_query_column = child_query.resolve_derived_column(column)
          resolved_name =
            if alias_name
              alias_name
            elsif qualified
              child_query_column.qualified_name
            else
              child_query_column.name
            end
          Sql::DerivedQueryColumn.new(self, resolved_name, child_query_column)
        end
      end

      def build_tuple(field_values)
        child_query.tuple_builder.build_tuple(extract_field_values(field_values))
      end

      def flatten_table_refs
        [[self], []]
      end

      def size
        1
      end
    end
  end
end
