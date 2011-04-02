module Prequel
  module Expressions
    class Column
      attr_reader :table, :name, :type, :options
      delegate :resolve_in_relations, :to => :qualified_name

      def initialize(table, name, type, options = {})
        @table, @name, @type, @options = table, name, type, options
      end

      def alias_name
        nil
      end

      def default_value
        options[:default]
      end

      def eq(other)
        Equal.new(self, other)
      end

      def qualified_name
        "#{table.name}__#{name}".to_sym
      end

      def inspect
        "#{table.name}.#{name}"
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

      def normalize_field_value(value)
        return value unless type == :datetime
        case value
          when Time, NilClass
            value
          when Integer
            Time.at(value / 1000)
          else
            raise "Can't convert value #{value.inspect} for storage as a :datetime"
        end
      end

      def wire_representation
        {
          'type' => "column",
          'table' => table.name.to_s,
          'name' => name.to_s
        }
      end
    end
  end
end
