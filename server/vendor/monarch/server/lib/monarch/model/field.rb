module Model
  class Field
    attr_reader :record, :column, :value

    def initialize(record, column)
      @record, @column = record, column
    end

    def value=(value)
      @value = column.convert_value(value)
      record.dirty = true
    end

    def to_sql
      value.to_sql
    end
  end
end
