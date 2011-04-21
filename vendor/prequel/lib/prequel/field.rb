module Prequel
  class Field
    attr_reader :tuple, :column, :value, :clean_value
    delegate :name, :type, :to => :column

    def initialize(tuple, column)
      @tuple, @column = tuple, column
    end

    def value=(value)
      @value = column.normalize_field_value(value)
      @dirty = (value != clean_value)
    end

    def wire_representation
      column.convert_value_for_wire(value)
    end

    def dirty?
      @dirty
    end

    def mark_clean
      @dirty = false
      @clean_value = value
    end

    def update_changeset(changeset)
      changeset.changed(name, clean_value, value) if dirty?
    end
  end
end