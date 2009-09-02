module Model
  class Field
    attr_reader :tuple, :column, :value

    def initialize(tuple, column)
      @tuple, @column = tuple, column
    end

    def value=(value)
      @value = column.convert_value(value)
      tuple.dirty = true
    end

    def to_sql
      value.to_sql
    end
  end
end
