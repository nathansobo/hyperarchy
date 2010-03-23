module Model
  class Field
    attr_reader :record, :column, :value, :remote_value, :validation_errors
    delegate :name, :table, :to => :column

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
      @remote_value = value
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

    def snapshot
      snapshot = Field.new(record, column)
      snapshot_value = remote_value
      snapshot.instance_eval do
        @value = snapshot_value
        @snapshot = true
      end
      snapshot
    end

    def snapshot?
      @snapshot
    end

    protected
    def mark_dirty
      @dirty = true
      @validated = false
      @validation_errors = []
    end
  end
end
