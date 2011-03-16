module Prequel
  class Field
    attr_reader :tuple, :column, :value

    def initialize(tuple, column)
      @tuple, @column = tuple, column
    end

    def value=(value)
      @value = value
      @dirty = true
    end

    def dirty?
      @dirty
    end

    def mark_clean
      @dirty = false
    end
  end
end