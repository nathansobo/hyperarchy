module Model
  class Field
    attr_reader :record, :column, :validation_errors
    delegate :name, :to => :column

    def initialize(record, column)
      @record, @column = record, column
      mark_clean
    end

    def value_wire_representation
      column.convert_value_for_wire(value)
    end

    def mark_clean
      @dirty = false
      @validation_errors = []
    end

    def dirty?
      @dirty
    end

    def mark_validated
      @validated = true
    end

    def validated?
      @validated
    end

    def valid?
      validation_errors.empty?
    end

    protected
    def mark_dirty
      @dirty = true
      @validated = false
    end
  end
end
