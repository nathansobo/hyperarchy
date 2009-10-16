module Model
  class Column
    class << self
      def from_wire_representation(representation, repository)
        table = repository.resolve_table_name(representation["table"].to_sym)
        table.column(representation["name"].to_sym)
      end
    end

    attr_reader :table, :name, :type

    def initialize(table, name, type)
      @table, @name, @type = table, name, type
    end

    def ruby_type
      case type
      when :string
        String
      when :integer
        Integer
      when :datetime
        Time
      end
    end

    def convert_value_for_storage(value)
      case type
      when :datetime
        convert_datetime_value_for_storage(value)
      else
        value
      end
    end

    def convert_value_for_wire(value)
      case type
      when :datetime
        value ? value.to_millis : nil
      else
        value
      end
    end

    def to_sql
      "#{table.global_name}.#{name}"
    end

    def to_aliased_sql
      "#{to_sql} as #{table.global_name}__#{name}"
    end

    def eq(right_operand)
      Predicates::Eq.new(self, right_operand)
    end

    def as(column_alias)
      ProjectedColumn.new(self, column_alias.to_sym)
    end

    protected
    def convert_datetime_value_for_storage(value)
      case value
      when Time
        value
      when Integer
        Time.at(value / 1000)
      end
    end
  end
end
