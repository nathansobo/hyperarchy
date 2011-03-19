module Prequel
  module Relations
    class Table < Relation
      attr_reader :name, :columns_by_name, :synthetic_columns, :tuple_class
      delegate :create, :to => :tuple_class

      def initialize(name, tuple_class=nil, &block)
        @name, @tuple_class = name, tuple_class
        @columns_by_name = {}
        @synthetic_columns = []
        TableDefinitionContext.new(self).instance_eval(&block) if block
      end

      def def_column(name, type, options = {})
        columns_by_name[name] = Expressions::Column.new(self, name, type, options)
      end

      def def_synthetic_column(name, type)
        synthetic_columns.push(Expressions::Column.new(self, name, type))
      end

      def [](col_name)
        "#{name}__#{col_name}".to_sym
      end

      def get_column(column_name)
        if column_name.match(/(.+)__(.+)/)
          qualifier, column_name = $1.to_sym, $2.to_sym
          return nil unless qualifier == name
        end
        columns_by_name[column_name]
      end

      def get_table(table_name)
        self if name == table_name
      end

      def columns
        columns_by_name.values
      end

      def visit(query)
        query.table_ref = table_ref(query)
      end

      def singular_table_ref(query)
        query.add_singular_table_ref(self, Sql::TableRef.new(self))
      end

      def singular_name
        @singular_name = name.to_s.singularize.to_sym
      end

      def infer_join_columns(columns)
        columns.each do |column|
          return [self[:id], column.qualified_name] if column.name =~ /(.+)_id$/ && $1.to_sym == singular_name
        end
        nil
      end

      def tables
        [self]
      end

      def wire_representation
        {
          'type' => 'table',
          'name' => name.to_s
        }
      end

      class TableDefinitionContext
        attr_reader :table
        def initialize(table)
          @table = table
        end

        def column(name, type)
          table.def_column(name, type)
        end
      end
    end
  end
end
