module Model
  class Field
    attr_reader :record, :column, :value

    def initialize(record, column)
      @record, @column = record, column
      mark_clean
    end

    def value=(value)
      new_value = column.convert_value_for_storage(value)
      if @value != new_value
        @value = new_value
        mark_dirty
      end
    end

    def value_wire_representation
      column.convert_value_for_wire(value)
    end

    def to_sql
      value.to_sql
    end

    def dirty?
      @dirty
    end

    def mark_clean
      @dirty = false
    end

    protected
    def mark_dirty
      @dirty = true
    end
  end
end
