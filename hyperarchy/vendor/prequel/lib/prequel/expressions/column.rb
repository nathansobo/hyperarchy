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
        case type
          when :integer
            value.nil?? nil : Integer(value)
          when :float
            value.nil?? nil : Float(value)
          when :datetime
            normalize_datetime_value(value)
          when :boolean
            normalize_boolean_value(value)
          else
            value
        end
      end

      def convert_value_for_wire(value)
        if type == :datetime
          value.try(:to_millis)
        else
          value
        end
      end

      def wire_representation
        {
          'type' => "column",
          'table' => table.name.to_s,
          'name' => name.to_s
        }
      end

      protected

      def normalize_datetime_value(value)
        case value
          when Time, NilClass
            value
          when Integer
            Time.at(value / 1000)
          else
            raise "Can't convert value #{value.inspect} for storage as a :datetime"
        end
      end

      def normalize_boolean_value(value)
        case value
          when true, 'true', 1, '1'
            true
          when false, 'false', 0, '0'
            false
          when NilClass
            nil
          else
            raise "Can't convert value #{value.inspect} for storage as a :boolean"
        end
      end
    end
  end
end
