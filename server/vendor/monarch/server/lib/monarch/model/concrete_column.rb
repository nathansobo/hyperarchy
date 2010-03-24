module Model
  class ConcreteColumn < Column
    class << self
      def from_wire_representation(representation, repository)
        table = repository.resolve_table_name(representation["table"].to_sym)
        table.column(representation["name"].to_sym)
      end
    end

    attr_reader :table, :name, :type, :default_value

    def initialize(table, name, type, options={})
      super(table, name, type)
      @default_value = options[:default]
    end

    def eq(right_operand)
      Predicates::Eq.new(self, right_operand)
    end

    def neq(right_operand)
      Predicates::Neq.new(self, right_operand)
    end

    def +(right_operand)
      Expressions::Plus.new(self, right_operand)
    end

    def as(column_alias)
      AliasedColumn.new(self, column_alias.to_sym)
    end

    def max
      AggregationExpression.new('max', self)
    end

    def min
      AggregationExpression.new('min', self)
    end

    def sum
      AggregationExpression.new('sum', self)
    end

    def count
      AggregationExpression.new('count', self)
    end

    def create_column(generator)
      if name == :id
        generator.primary_key(name, schema_type)
      else
        generator.column(name, schema_type)
      end
    end

    def convert_value_for_storage(value)
      case type
      when :key
        convert_key_value_for_storage(value)
      when :integer
        value.to_i
      when :float
        value.to_f
      when :datetime
        convert_datetime_value_for_storage(value)
      when :boolean
        convert_boolean_value_for_storage(value)
      else
        value
      end
    end

    def to_sql
      "#{table.global_name}.#{name}"
    end

    def sql_expression
      Sql::ColumnRef.new(table.sql_table_ref, name)
    end

    def to_select_clause_sql
      "#{to_sql} as #{name}"
    end

    protected
    def schema_type
      case type
      when :key
        Integer
      when :string
        String
      when :integer
        Integer
      when :float
        Float
      when :datetime
        Time
      end
    end
    
    def convert_key_value_for_storage(value)
      case value
      when Integer, NilClass
        value
      when String
        if Model.convert_strings_to_keys
          value.to_key
        else
          Integer(value)
        end
      else
        raise "Key assignment to #{value.inspect} invalid. You can only store integers and strings (which are converted to integers via hash) in :key fields"
      end
    end

    def convert_datetime_value_for_storage(value)
      case value
      when Time
        value
      when Integer
        Time.at(value / 1000)
      when String
        Sequel.string_to_datetime(value)
      end
    end

    def convert_boolean_value_for_storage(value)
      case value
      when "t", 1, true
        true
      when "f", 0, false
        false
      when nil
        nil
      else
        raise "Invalid boolean representation: #{value.inspect}"
      end
    end
  end
end
