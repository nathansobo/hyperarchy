module Prequel
  module Expressions
    class Column
      attr_reader :table, :name, :type

      def initialize(table, name, type)
        @table, @name, @type = table, name, type
      end

      def alias_name
        nil
      end

      def eq(other)
        Equal.new(self, other)
      end

      def qualified_name
        "#{table.name}__#{name}".to_sym
      end

      def expression
        self
      end

      def origin
        self
      end

      def resolve_in_query(query)
        query.singular_table_refs[table].resolve_column(self)
      end
    end
  end
end